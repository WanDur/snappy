import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform } from "react-native";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return React.useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync<T>(key: string, value: T | null) {
  const stringValue = value != null ? JSON.stringify(value) : "";
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error("Failed to set storage item:", error);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, stringValue);
    }
  }
}

export async function getStorageItemAsync<T>(key: string): Promise<T | null> {
  const item = await SecureStore.getItemAsync(key);
  return item ? JSON.parse(item) : null;
}

export function useStorageState<T>(key: string): UseStateHook<T> {
  const [state, setState] = useAsyncState<T>();
  const loadState = async () => {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          const value = localStorage.getItem(key);
          setState(value ? JSON.parse(value) : null);
        }
      } catch (error) {
        console.error("Failed to load storage item:", error);
      }
    } else {
      const value = await getStorageItemAsync<T>(key);
      setState(value);
    }
  };

  React.useEffect(() => {
    loadState();
  }, [key]);

  // React.useEffect(() => {
  //   console.log("The value of session changed: ", state)
  // }, [state])

  const setValue = React.useCallback(
    (value: T | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key]
  );

  return [state, setValue];
}
