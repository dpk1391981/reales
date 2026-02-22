"use client";

import { Provider, useSelector } from "react-redux";
import { store } from "@/store";
import AuthInitializer from "./AuthInitializer";
import MasterInitializer from "./MasterInitializer";
import GlobalLoading from "./loading";

function AppContent({ children }: { children: React.ReactNode }) {
  const masters = useSelector((state: any) => state.masters);

  if (!masters?.loaded) {
    return <GlobalLoading />;
  }

  return <>{children}</>;
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <MasterInitializer />
      <AppContent>{children}</AppContent>
    </Provider>
  );
}