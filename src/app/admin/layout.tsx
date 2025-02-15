import  CheckRole  from "@/app/admin/CheckRole"; // Asegúrate de importar el componente
import { Footer, Navbar, SideMenu } from "@/components/layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CheckRole>
  <Navbar />
  <div className="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
    <SideMenu />
    <div className="relative p-5 w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900">
      {children}
      <Footer />
    </div>
  </div>
</CheckRole>

      <Navbar />
      <div className="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <SideMenu />

        <div className="relative p-5 w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900">
          {children}
          <Footer />
        </div>
      </div>
    </>
  );
}