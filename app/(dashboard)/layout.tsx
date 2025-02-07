import { NavBar } from "./_components/navbar";
import { OrgSidebar } from "./_components/org-sidebar";
import { Sidebar } from "./_components/Sidebar"
interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout = ({
  children,
}: DashboardLayoutProps) => {
  return (
    <main className="min-h-full h-full">
      <Sidebar />
      <div className="h-full md:pl-[60px]">
        <div className="flex gap-x-3 h-full">
          <OrgSidebar />
          <div className="h-full flex-1">
            <NavBar />
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardLayout