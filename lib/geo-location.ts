"use server";

import { headers } from "next/headers";

export async function getIPAddress() {
  return headers().get("x-forwarded-for");
}

export async function geoLocation() {
  const ip = "24.48.0.1";
  const response = await fetch(
    `http://ip-api.com/json/${ip}?fields=status,country,countryCode,query`
  );
  const locationDatas = await response.json();
  // console.log(locationDatas);
  return locationDatas;
}
