"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/data/datasources/supabase/client";
import { LogOut, User, Settings, FlaskConicalIcon, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/ui/components/LanguageSwitcher";
import { MemberView } from "@/domain/entities/views/admin/memberView";

export default function AdminHeader({ adminUser }: { adminUser: MemberView }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - mostly for mobile menu trigger spacing if needed, or breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger is in Sidebar component, but we can add a placeholder or breadcrumbs here */}
            <h2 className="text-lg font-semibold text-gray-800 hidden md:flex items-center gap-2 ">

              {adminUser.role === 'moderator' ?
                <>
                  <Truck className="w-5 h-5 mx-2 text-red-700" />
                  {t('trackOrders')}
                </>

                :
                <>
                  <FlaskConicalIcon className="w-5 h-5 mx-2 text-red-700" />
                  {t('adminPanel')}
                </>
              }
            </h2>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">


            <LanguageSwitcher />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
              >
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{adminUser.name || 'Staff'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{adminUser.role}</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                  <span className="text-white font-medium text-sm">
                    {(adminUser.name || 'S').charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="font-semibold text-gray-900">{adminUser.name || 'Staff'}</p>
                      <p className="text-xs text-gray-500 truncate">{adminUser.email}</p>
                    </div>

                    <div className="p-1">
                      {/*     <button
                        onClick={() => router.push("/admin/profile")}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 mx-3 text-gray-400" />
                        {t("profile")}
                      </button>
*/}
                      <button
                        onClick={() => router.push("/")}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 mx-3 text-gray-400" />
                        {t("backToSite")}
                      </button>
                    </div>

                    <div className="border-t border-gray-50 p-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4 mx-3" />
                        {t("logout")}
                      </button>
                    </div>
                  </div>
                </>
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
        <User className="w-4 h-4 mx-3" />
        {t("profile")}
      </button>

      <button
        onClick={() => router.push("/")}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Settings className="w-4 h-4 mx-3" />
        {t("backToSite")}
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <LogOut className="w-4 h-4 mx-3" />
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
