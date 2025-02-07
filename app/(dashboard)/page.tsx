"use client";
import { useOrganization } from "@clerk/nextjs";
import { EmptyOrg } from "./_components/empty-org";
import { BoardList } from "./_components/board-list";


interface DashboardProps {
	searchParams?: {
		search?: string;
		favorites?: string;
	};
};

const Dashboard = ({
	searchParams = {},
}: DashboardProps) => {
	const { organization } = useOrganization();
	return (
		<div className="flex-1 h-[calc(100% - 80px)] p-6">
			{/* {JSON.stringify(searchParams)} */}
			{!organization ? (
				<EmptyOrg />
			) : (
				<BoardList
					orgId={organization.id}
					query={searchParams}
				/>
			)}
		</div>
	);
};

export default Dashboard;
