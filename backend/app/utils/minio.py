"""
Utilities for uploading files to MinIO Storage
"""

import base64
from io import BytesIO, IOBase
import mimetypes
from typing import Annotated
from urllib import parse as urlparse
from fastapi import File, HTTPException
from fastapi.responses import StreamingResponse
from minio import Minio
from PIL import Image
from Crypto.Cipher import AES
from Crypto.Hash import SHA256
from Crypto.Protocol.KDF import HKDF
import os

from utils.debug import log_debug
from utils.settings import get_settings

settings = get_settings()

client = Minio(
    "localhost:9000", settings.MINIO_ACCESS_KEY, settings.MINIO_SECRET_KEY, secure=False
)
APP_BUCKET = "snappy"


def encrypt_AES_GCM_contained(msg: str) -> str:
    """
    Encrypt message with AES-GCM, return the encrypted message that contains decryption info, only used for not sensitive data
    """
    kdf_salt = os.urandom(settings.AES_SALT_SIZE)
    key: bytes = HKDF(
        settings.AES_CONTAINED_SECRET_KEY.encode("utf-8"),
        settings.AES_KEY_SIZE,
        kdf_salt,
        SHA256,
    )
    nonce = os.urandom(settings.AES_NONCE_SIZE)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce, mac_len=settings.AES_TAG_SIZE)
    ciphertext, tag = cipher.encrypt_and_digest(msg.encode("utf-8"))
    return base64.b64encode(kdf_salt + nonce + ciphertext + tag).decode("utf-8")


def decrypt_AES_GCM_contained(encrypted_msg: str) -> str:
    """Decrypt message with AES-GCM, return the plaintext"""
    decoded_data = base64.b64decode(encrypted_msg)
    kdf_salt = decoded_data[: settings.AES_SALT_SIZE]
    nonce = decoded_data[
        settings.AES_SALT_SIZE : settings.AES_SALT_SIZE + settings.AES_NONCE_SIZE
    ]
    ciphertext = decoded_data[
        settings.AES_SALT_SIZE + settings.AES_NONCE_SIZE : -settings.AES_TAG_SIZE
    ]
    tag = decoded_data[-settings.AES_TAG_SIZE :]
    key: bytes = HKDF(settings.AES_CONTAINED_SECRET_KEY.encode("utf-8"), settings.AES_KEY_SIZE, kdf_salt, SHA256)  # type: ignore
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce, mac_len=settings.AES_TAG_SIZE)
    return cipher.decrypt_and_verify(ciphertext, tag).decode("utf-8")


def optimize_image(file: Annotated[bytes, File()]) -> BytesIO:
    """
    Check if the given file is a valid image file
    """
    try:
        img = Image.open(BytesIO(file))
    except:
        raise HTTPException(400, "Invalid image file")

    buf = BytesIO()
    img.save(
        buf, format="jpeg", speed=4, quality=50, xmp=b"", exif=b"", icc_profile=b""
    )
    if buf.tell() > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            413, f"File size must be less than {settings.MAX_UPLOAD_SIZE / 2**20} MB"
        )
    buf.seek(0)
    return buf


def upload_file_stream(path: str, file: IOBase) -> str:
    file.read()
    file_size = file.tell()
    file.seek(0)
    log_debug(f"Uploading file to MinIO: {path}, size: {file_size}")
    client.put_object(APP_BUCKET, path, file, file_size)
    return urlparse.quote(encrypt_AES_GCM_contained(path), safe="")


def upload_file(path: str, file: bytes) -> str:
    """
    Upload a file to MinIO Storage
    """
    file = BytesIO(file)
    return upload_file_stream(path, file)


def get_public_file(path: str):
    try:
        log_debug("hi")
        minio_path = decrypt_AES_GCM_contained(path)
        log_debug(f"minio_path: {minio_path}")
        file_stream = client.get_object(APP_BUCKET, minio_path)
        filename = minio_path.split("/")[-1]
        media_type, _ = mimetypes.guess_type(filename)
        if media_type is None:
            media_type = "application/octet-stream"
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={
                "Content-Disposition": f"inline; filename={filename}",
                "Cache-Control": "public, max-age=31536000",
            },
        )
    except Exception as e:
        log_debug(e)
        raise HTTPException(404, f"File not found")
