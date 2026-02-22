import axiosInstance from "@/lib/axiosConfig";

export const sendOtpApi = (payload: { phone: string }) =>
  axiosInstance.post("/auth/request-otp", payload);

export const verifyOtpApi = (payload: { phone: string; otp: string }) =>
  axiosInstance.post("/auth/verify-otp", payload);

export const loginApi = (payload: any) => {
  return axiosInstance.post("/auth/login", payload);
};

export const getProfileApi = () => {
  return axiosInstance.get("/auth/profile");
};