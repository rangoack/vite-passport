import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookOpenSolid from "../assets/bookOpenSolid";
import BookOpenOutline from "../assets/bookOpenOutline";
import WalletSolid from "../assets/walletSolid";
import WalletOutline from "../assets/walletOutline";
import SettingsSolid from "../assets/settingsSolid";
import SettingsOutline from "../assets/settingsOutline";

type Props = {
	children: ReactNode;
	heading?: string;
};

const TabContainer = ({ heading, children }: Props) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();

	return (
		<div className="h-full flex flex-col">
			{heading && (
				<div className="h-9 xy">
					<p className="text-lg font-bold">{heading}</p>
				</div>
			)}
			<div className="top-0 flex-1 flex flex-col">{children}</div>
			{/* <div className="top-0 flex-1 overflow-scroll bg-white">{null}</div> */}
			<div className="h-[4.35rem] rounded-t-[24px] flex shadow-t-2 bg-white">
				{[
					['/home', WalletOutline, WalletSolid],
					['/my-transactions', BookOpenOutline, BookOpenSolid],
					['/settings', SettingsOutline, SettingsSolid],
				].map(([to, OutlineIcon, SolidIcon]) => {
					const active = pathname === to;
					const Icon = active ? SolidIcon : OutlineIcon;
					return (
						<button
							key={to as string}
							disabled={active}
							className={`flex-1 xy ${active ? 'text-skin-lowlight' : 'text-skin-highlight'}`}
							onClick={() => navigate(to as string, { replace: true })}
						>
							<Icon />
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default TabContainer;
