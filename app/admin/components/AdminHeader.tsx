"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AdminUser } from "@/lib/adminAuthClient";
import { LogOut, User, Settings } from "lucide-react";
import { useTranslation } from "@/app/components/TranslationProvider";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";

interface AdminHeaderProps {
  adminUser: AdminUser;
}

export default function AdminHeader({ adminUser }: AdminHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("adminPanel")}</h1>
            <p className="text-sm text-gray-600">{t("welcomeBack")}, {adminUser.name}</p>
          </div>

          <div className="flex items-center space-x-6">
            <LanguageSwitcher

            />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm rounded-lg hover:bg-primary-50 px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{adminUser.name}</p>
                  <p className="text-xs text-gray-500">{adminUser.role}</p>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <p className="font-medium">{adminUser.name}</p>
                    <p className="text-xs text-gray-500">{adminUser.email}</p>
                  </div>

                  <button
                    onClick={() => router.push("/admin/profile")}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    {t("profile")}
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500" />
                    {t("backToSite")}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

{/* <div className="relative">
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="cursor-pointer flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
  >
    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
      <User className="w-4 h-4 text-white" />
    </div>
    <div className="text-left">
      <p className="font-medium text-gray-900">{adminUser.name}</p>
      <p className="text-xs text-gray-500">{adminUser.role}</p>
    </div>
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200  ">
      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
        <p className="font-medium">{adminUser.name}</p>
        <p className="text-xs text-gray-500">{adminUser.email}</p>
      </div>

      <button
        onClick={() => router.push("/profile")}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <User className="w-4 h-4 mr-3" />
        {t("profile")}
      </button>

      <button
        onClick={() => router.push("/")}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Settings className="w-4 h-4 mr-3" />
        {t("backToSite")}
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <LogOut className="w-4 h-4 mr-3" />
        {t("logout")}
      </button>
    </div>
  )}
</div>
        </div >
      </div >
    </header >
  );
} */}
