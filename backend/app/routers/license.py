"""
Component for all license related logics and routes
"""

from datetime import datetime
import random
import string
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import ORJSONResponse
from odmantic import AIOEngine
from pydantic import BaseModel

from internal.models import License, User, UserTier
from utils.auth import get_user
from utils.debug import log_debug
from utils.mongo import get_prod_database

license_router = APIRouter(prefix="/license", tags=["license"])


class RedeemLicenseBody(BaseModel):
    keys: list[str]


class RedeemLicenseSuccessResponse(BaseModel):
    expireTime: datetime


class RedeemLicenseFailureResponse(BaseModel):
    status: str
    message: str
    invalidKeys: list[str]
    redeemedKeys: list[str]


@license_router.post("/redeem")
async def redeem_license(
    body: RedeemLicenseBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> RedeemLicenseSuccessResponse | RedeemLicenseFailureResponse:
    if user is None:
        raise HTTPException(status_code=401, detail="Unauthorized")

    licenses = {"valid": [], "invalid": [], "redeemed": []}
    for key in body.keys:
        license = await License.get_license(engine, key)
        if license:
            if license.redeemed:
                licenses["redeemed"].append(key)
            else:
                licenses["valid"].append(license)
        else:
            licenses["invalid"].append(key)

    if len(licenses["invalid"]) > 0 or len(licenses["redeemed"]) > 0:
        return ORJSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "Invalid licenses",
                "invalidKeys": licenses["invalid"],
                "redeemedKeys": licenses["redeemed"],
            },
        )

    addedDays = 0
    for license in licenses["valid"]:
        await license.redeem(engine, user)
        addedDays += license.days

    return ORJSONResponse(
        status_code=200,
        content={
            "expireTime": user.premiumExpireTime,
            "addedDays": addedDays,
        },
    )


async def generate_license_keys(
    engine: AIOEngine = Depends(get_prod_database),
    days: int = 30,
    count: int = 1,
) -> list[str]:
    licenses = []
    while len(licenses) < count:
        key = "-".join(
            [
                "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
                for _ in range(4)
            ]
        )
        if await License.get_license(engine, key) is None:
            license = License(key=key, days=days)
            licenses.append(license)
    await engine.save_all(licenses)
    return [license.key for license in licenses]


class GenerateLicenseBody(BaseModel):
    days: int
    count: int


class GenerateLicenseResponse(BaseModel):
    keys: list[str]


@license_router.post("/generate")
async def generate_license(
    body: GenerateLicenseBody,
    engine: AIOEngine = Depends(get_prod_database),
    user: User | None = Depends(get_user),
) -> GenerateLicenseResponse:
    if user is None or user.tier != UserTier.ADMIN:
        log_debug(user.tier)
        raise HTTPException(status_code=401, detail="Unauthorized")
    keys = await generate_license_keys(engine, body.days, body.count)
    return GenerateLicenseResponse(keys=keys)
