import { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import PageContainer from '../components/PageContainer';
import Secrets from '../containers/Secrets';
import { wallet } from '@vite/vitejs';
import { useLocation } from 'react-router-dom';
import A from '../components/A';

const Create = ({ i18n, secrets, setState }: State) => {
	const [isVisible, setIsVisible] = useState(false);
	const { state } = useLocation() as {
		state: { routeAfterUnlock?: string };
	};
	const createMnemonics = useCallback(
		(twelveWords = false) => {
			const mnemonics = wallet.createMnemonics(twelveWords ? 128 : 256);
			setState({ secrets: { mnemonics } });
		},
		[setState]
	);
	const mnemonicsLength = useMemo(
		() => (!secrets?.mnemonics ? null : secrets.mnemonics.split(' ').length),
		[secrets?.mnemonics]
	);
	useEffect(() => {
		if (!secrets?.mnemonics) {
			createMnemonics();
		}
	}, [secrets?.mnemonics, createMnemonics]);

	return !secrets?.mnemonics ? null : (
		<PageContainer heading={i18n.createWallet}>
			<section className="self-center">
				{ isVisible && (
					<div className="w-full flex flex-col">
						<div className="self-start flex rounded-full bg-white">
							<button
								className={`text-sm font-normal px-3 py-[6px] rounded-full ${
									mnemonicsLength === 12
										? 'text-white bg-skin-highlight'
										: 'text-skin-highlight bg-white'
								}`}
								onClick={() => createMnemonics(true)}
							>
								{i18n._12Words}
							</button>
							<button
								className={`text-sm font-normal px-3 py-[6px] rounded-full ${
									mnemonicsLength === 24
										? 'text-white bg-skin-highlight'
										: 'text-skin-highlight bg-white'
								}`}
								onClick={() => createMnemonics()}
							>
								{i18n._24Words}
							</button>
						</div>
					</div>
				)}
				{ isVisible && (<Secrets mnemonics={secrets.mnemonics} className="mt-4 self-center" />)}

				{ !isVisible && (
					<div className="bg-white rounded-3xl shadow-t-2 divide-y divide-skin-highlight">
						<div className="xy h-[52px]">
							<p className="text-lg text-center leading-4 text-black font-bold">{i18n.secrets}</p>
						</div>
						<p className="px-8 py-5 font-normal text-black">
							{
								i18n.youAreAboutToViewYourMnemonicPhraseAnyoneWhoSeesItCanStealYourWalletSoMakeSureNoOneElseIsLooking
							}
						</p>
						<button
							className="xy h-[52px] w-full text-black font-bold"
							onClick={ () => setIsVisible(true) }
						>
							{i18n.view}
						</button>
					</div>
				)}
			</section>
			
			<section>
				<p className="mb-1 text-white text-xs">{i18n.storeTheseWordsSomewhereSafe}</p>
				{ isVisible
					? (<A
						to="/create2"
						className="h-12 w-full xy rounded-xl bg-white text-black text-lg font-bold"
						state={state}
					>
						{i18n.next}
					</A>)
					: (<button
						disabled
						className="h-12 w-full xy rounded-xl bg-white text-black text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{i18n.next}
					</button>)
				}
			</section>
		</PageContainer>
	);
};

export default connect(Create);
