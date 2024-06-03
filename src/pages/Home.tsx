import {
	DownloadIcon,
	UploadIcon,
} from '@heroicons/react/outline';
import { wallet } from '@vite/vitejs';
import { AddressObj } from '@vite/vitejs/distSrc/utils/type';
import { useEffect, useMemo, useState } from 'react';
import A from '../components/A';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ModalListItem from '../components/ModalListItem';
import QR from '../components/QR';
import TabContainer from '../components/TabContainer';
import SendTokenFlow from '../containers/SendTokenFlow';
import TextInput, { useTextInputRef } from '../containers/TextInput';
import TokenCard from '../containers/TokenCard';
import TokenSearchBar from '../containers/TokenSearchBar';
import WalletContents from '../containers/WalletContents';
import { connect } from '../utils/global-context';
import { formatPrice, getCurrentTab, getTokenApiInfo, validateInputs } from '../utils/misc';
import { getValue, setValue } from '../utils/storage';
import {
	addIndexToTokenSymbol,
	getHostname,
	shortenAddress,
	validateHttpUrl,
	validateWsUrl,
} from '../utils/strings';
import { State, Storage, TokenApiInfo } from '../utils/types';
import WalletOutline from "../assets/walletOutline";
import CopyOutline from '../assets/copy';
import ShareOutline from '../assets/share';

// constant.Contracts.StakeForQuota_V1
// constant.Contracts.StakeForQuota

const Home = ({
	i18n,
	setState,
	secrets,
	activeAccountIndex,
	activeAccount,
	activeNetwork,
	copyWithToast,
	networkList,
	activeNetworkIndex,
	derivedAddresses,
	contacts,
	toastSuccess,
	triggerInjectedScriptEvent,
	connectedDomains,
	viteBalanceInfo,
	currencyConversion,
	portfolioValue,
	toastInfo,
	homePageTokenIdsAndNames,
}: State) => {
	// const quotaBeneficiaryRef = useTextInputRef();
	// const lockedAmountRef = useTextInputRef();
	const networkNameRef = useTextInputRef();
	const rpcUrlRef = useTextInputRef();
	const blockExplorerUrlRef = useTextInputRef();
	const [editingNetwork, editingNetworkSet] = useState(false);
	const [addingNetwork, addingNetworkSet] = useState(false);
	const [changingActiveAccount, changingActiveAccountSet] = useState(false);
	// const [votingModalOpen, votingModalOpenSet] = useState(false);
	// const [quotaModalOpen, quotaModalOpenSet] = useState(false);
	// const [quotaBeneficiary, quotaBeneficiarySet] = useState('');
	// const [lockedAmount, lockedAmountSet] = useState('');
	const [receiving, receivingSet] = useState(false);
	const [sending, sendingSet] = useState(false);
	const [viewingConnected, viewingConnectedSet] = useState(false);
	const [hostname, hostnameSet] = useState('');
	const [tokensInWallet, tokensInWalletSet] = useState<TokenApiInfo[]>([]);
	const [filteredTokensInWallet, filteredTokensInWalletSet] = useState<TokenApiInfo[]>([]);
	const [tokenSendInfo, tokenSendInfoSet] = useState<undefined | TokenApiInfo>();

	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const connected = useMemo(
		() => (!hostname ? false : !!connectedDomains[activeAccount.address]?.[hostname]),
		[connectedDomains, activeAccount, hostname]
	);

	useEffect(() => {
		getCurrentTab().then((tab) => hostnameSet(getHostname(tab.url)));
	}, []);

	if (!derivedAddresses) {
		// This should never happen. Wallet should be created before they can view `/home` route.
		throw new Error('derivedAddresses does not exist');
	}

	return (
		<TabContainer>
			<section className="radial-green2blue z-10 rounded-b-[24px]">
				<div className="pt-8 px-5 pb-2.5">
					<div className="grid grid-cols-[32px_1fr_32px] gap-4">
						<div className="h-9 w-9 p-1 bg-white rounded-full">
							<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 85 82" fill="none">
								<path d="M29.7804 21.7397L12.3104 9.05973C6.20038 4.62973 -1.82962 11.2097 1.36038 18.0497C9.30038 35.0197 18.8504 55.4997 22.2604 63.0697L33.9804 37.9397C36.6404 32.2297 34.8804 25.4397 29.7704 21.7297L29.7804 21.7397Z" fill="url(#paint0_linear_1708_12762)" />
								<path d="M71.3307 4.50992L83.3307 30.0399C86.0007 35.7099 84.1807 42.4699 79.0407 46.0599L29.9107 80.3399C26.8407 82.4799 22.9207 79.1899 24.5007 75.8099L57.8307 4.51993C60.5007 -1.19007 68.6507 -1.20008 71.3307 4.50992Z" fill="url(#paint1_linear_1708_12762)" />
								<defs>
									<linearGradient id="paint0_linear_1708_12762" x1="8.21038" y1="38.8097" x2="32.7504" y2="24.5897" gradientUnits="userSpaceOnUse">
										<stop stopColor="#00BEFF" />
										<stop offset="1" stopColor="#00FF95" />
									</linearGradient>
									<linearGradient id="paint1_linear_1708_12762" x1="13.2007" y1="59.4299" x2="80.5707" y2="20.4099" gradientUnits="userSpaceOnUse">
										<stop stopColor="#00BEFF" />
										<stop offset="1" stopColor="#00FF95" />
									</linearGradient>
								</defs>
							</svg>
						</div>
						<div>
							<button
								className="text-sm text-white font-bold"
								onClick={() => editingNetworkSet(true)}
							>
								{activeNetwork.name}
							</button>
							<button
								disabled={!connected}
								className="fx"
								onClick={() => viewingConnectedSet(true)}
							>
								<div
									className={`h-2 w-2 rounded-full ${
										connected ? 'bg-skin-lowlight' : 'bg-white'
									}`}
								/>
								<p className="ml-1 text-xs text-white font-normal">
									{connected ? i18n.connected : i18n.disconnected}
								</p>
							</button>
						</div>
						<button onClick={() => changingActiveAccountSet(true)}>
							<WalletOutline className="stroke-white" />
						</button>
					</div>
					<div className="xy flex-col mt-6">
						<p className="text-white text-lg font-bold mb-1">{contacts[activeAccount.address]}</p>
						<div className="flex rounded-full bg-white gap-2 py-1.5 px-4">
							<p className="text-sm text-skin-highlight font-bold">{shortenAddress(activeAccount.address)}</p>
							<button className="xy" onClick={() => copyWithToast(activeAccount.address)}>
								<CopyOutline size="16" />
							</button>
							{activeNetwork.explorerUrl && (
								<A
									className="xy"
									href={`${activeNetwork.explorerUrl}/address/${activeAccount.address}`}
								>
									<ShareOutline size="16" />
								</A>
							)}
						</div>
					</div>
				</div>
			</section>
			<section className="flex-1 px-5 my-4 overflow-scroll">
				{currencyConversion && (
					<p className="text-4xl text-center text-black mb-6">
						{portfolioValue !== undefined ? formatPrice(portfolioValue, 1, '$') : '...'}
					</p>
				)}
				<div className="xy gap-16 mb-6">
					<div className="fy">
						<button
							className="h-14 w-14 xy rounded-full bg-gradient-to-t from-[#C3F0FF] to-white to-84%"
							onClick={async () => {
								if (balanceInfoMap) {
									sendingSet(true);
									const arr = await getTokenApiInfo(
										activeNetwork.rpcUrl,
										homePageTokenIdsAndNames.map(([tti]) => tti)
									);
									tokensInWalletSet(arr);
									filteredTokensInWalletSet(arr);
								} else {
									toastInfo(i18n.waitForWalletBalanceToLoad);
								}
							}}
						>
							<UploadIcon className="w-8 text-skin-highlight" />
						</button>
						<p className='text-black text-lg font-bold mt-2'>{i18n.send}</p>
					</div>
					<div className="fy">
						<button
							className="h-14 w-14 xy rounded-full bg-gradient-to-t from-[#C3F0FF] to-white to-84%"
							onClick={() => receivingSet(true)}
						>
							<DownloadIcon className="w-8 text-skin-highlight" />
						</button>
						<p className='text-black text-lg font-bold mt-2'>{i18n.receive}</p>
					</div>
				</div>
				<WalletContents />
			</section>
			{/* <Modal
				visible={votingModalOpen}
				onClose={() => votingModalOpenSet(false)}
				heading={i18n.voting}
			>
				test
			</Modal>
			<Modal
				visible={quotaModalOpen}
				onClose={() => quotaModalOpenSet(false)}
				heading={i18n.quota}
			>
				<TextInput
					_ref={quotaBeneficiaryRef}
					label={i18n.quotaBeneficiary}
					value={quotaBeneficiary}
					onUserInput={(v) => quotaBeneficiarySet(v)}
				/>
				<TextInput
					_ref={lockedAmountRef}
					label={i18n.lockedAmount}
					value={lockedAmount}
					onUserInput={(v) => lockedAmountSet(v)}
				/>
			</Modal> */}
			{editingNetwork && (
				<Modal
					onClose={() => editingNetworkSet(false)}
					heading={i18n.networks}
					className='pb-5'
					buttonText={i18n.addNetwork}
					buttonTextColor='text-skin-highlight'
					onButtonClick={() => {
						editingNetworkSet(false);
						addingNetworkSet(true);
					}}
				>
					{networkList.map((network, i) => {
						const active = i === activeNetworkIndex;
						return (
							<ModalListItem
								radio
								key={network.rpcUrl}
								active={active}
								label={network.name}
								sublabel={network.rpcUrl}
								onClick={() => {
									if (!active) {
										toastSuccess(i18n.networkChanged);
									setState({
											activeNetworkIndex: i,
											activeNetwork: networkList[i],
											viteBalanceInfo: undefined,
											transactionHistory: undefined,
											homePageTokens: undefined,
										});
									setValue({ activeNetworkIndex: i });
										triggerInjectedScriptEvent({
											type: 'networkChange',
											payload: { activeNetwork: network },
										});
									}
									editingNetworkSet(false);
								}}
								onX={
									i < 3
										? undefined
										: () => {
											const newNetworkList = [...networkList];
											newNetworkList.splice(i, 1);
											const data = {
												networkList: newNetworkList,
												activeNetworkIndex: i === networkList.length - 1 ? 0 : activeNetworkIndex,
											};
										setState(data);
										setValue(data);
									}
								}
							/>
						);
					})}
				</Modal>
			)}
			{addingNetwork && (
				<Modal
					heading={i18n.addNetwork}
					onClose={() => {
						editingNetworkSet(true);
						addingNetworkSet(false);
					}}
					buttonText={i18n.add}
					onButtonClick={() => {
						const valid = validateInputs([networkNameRef, rpcUrlRef, blockExplorerUrlRef]);
						if (valid) {
							if (networkList.find((n) => n.rpcUrl === rpcUrlRef.value)) {
								return (rpcUrlRef.error = i18n.rpcUrlAlreadyInUse);
							}
							const newNetworkList = [
								...networkList,
								{
									name: networkNameRef.value.trim(),
									rpcUrl: rpcUrlRef.value.trim(),
									explorerUrl: blockExplorerUrlRef.value.trim() || undefined,
								},
							];
							const data = { networkList: newNetworkList };
							setState(data);
							setValue(data);
							addingNetworkSet(false);
							editingNetworkSet(true);
						}
					}}
				>
					<div className="space-y-3 p-3">
						<TextInput theme='black' _ref={networkNameRef} label={i18n.networkName} />
						<TextInput
							theme='black'
							_ref={rpcUrlRef}
							label={i18n.rpcUrl}
							getIssue={(v) => {
								if (!validateWsUrl(v) && !validateHttpUrl(v)) {
									return i18n.urlMustStartWithWsWssHttpOrHttps;
								}
							}}
						/>
						<TextInput
							theme='black'
							optional
							_ref={blockExplorerUrlRef}
							label={i18n.blockExplorerUrl}
							getIssue={(v) => {
								// console.log(v, validateHttpUrl(v));
								if (!validateHttpUrl(v)) {
									return i18n.urlMustStartWithHttpOrHttps;
								}
							}}
						/>
					</div>
				</Modal>
			)}
			{changingActiveAccount && (
				<Modal
					plusIcon
					heading={i18n.accounts}
					className='pb-5'
					onClose={() => changingActiveAccountSet(false)}
					buttonText={i18n.deriveAddress}
					buttonTextColor='text-skin-highlight'
					onButtonClick={() => {
						const newAccount: AddressObj = wallet.deriveAddress({
							...secrets!,
							index: derivedAddresses.length,
						});
						const data: Partial<Storage> = {
							derivedAddresses: [...derivedAddresses, newAccount.address],
							contacts: {
								...contacts,
								[newAccount.address]: `Account ${derivedAddresses.length}`,
							},
						};
						setState(data);
						setValue(data);
					}}
				>
					{derivedAddresses.map((address, i) => {
						const active = i === activeAccountIndex;
						return (
							<ModalListItem
								radio
								key={address}
								active={active}
								className="flex-1"
								label={contacts[address]}
								sublabel={shortenAddress(address)}
								onClick={async () => {
									if (!active) {
										toastSuccess(i18n.accountChanged);
										const data = { activeAccountIndex: i };
										setState({
											...data,
											activeAccount: wallet.deriveAddress({
												...secrets!,
												index: i,
											}),
											viteBalanceInfo: undefined,
											portfolioValue: undefined,
											transactionHistory: undefined,
										});
										setValue(data);
										const { connectedDomains } = await getValue('connectedDomains');
										const newActiveAddress = derivedAddresses[i];
										const newActiveAccountConnected =
											!!connectedDomains?.[newActiveAddress]?.[hostname];
										const lastAccountWasConnected =
											!!connectedDomains?.[activeAccount.address]?.[hostname];
										if (newActiveAccountConnected) {
											triggerInjectedScriptEvent({
												type: 'accountChange',
												payload: { activeAddress: newActiveAddress },
											});
										} else if (lastAccountWasConnected) {
											triggerInjectedScriptEvent({
												type: 'accountChange',
												payload: { activeAddress: undefined },
											});
										}
									}
									changingActiveAccountSet(false);
								}}
								onX={
									i + 1 !== derivedAddresses.length || i === 0
										? undefined
										: () => {
												const data: Partial<Storage> = {
													derivedAddresses: [...derivedAddresses].slice(
														0,
														derivedAddresses.length - 1
													),
													activeAccountIndex:
														activeAccountIndex === derivedAddresses.length - 1
															? 0
															: activeAccountIndex,
												};
												setState(data);
												setValue(data);
										  }
								}
							/>
						);
					})}
				</Modal>
			)}
			{receiving && (
				<Modal noHeader onClose={() => receivingSet(false)} className="p-4">
					<div className="xy gap-2 px-4 py-1.5 border border-skin-highlight rounded-full">
						<p className="text-sm text-skin-highlight">{shortenAddress(activeAccount.address)}</p>
						<button
							className="p-1.5 -m-1.5 xy"
							onClick={() => copyWithToast(activeAccount.address)}
						>
							<CopyOutline size="16" />
						</button>
					</div>
					<QR data={`vite:${activeAccount.address}`} className="mt-4" />
				</Modal>
			)}
			{sending && (
				<Modal
					fullscreen
					heading={i18n.send}
					onClose={() => sendingSet(false)}
					className="flex flex-col"
				>
					<div className="px-5">
						<TokenSearchBar
							onUserInput={(v) => {
								if (balanceInfoMap) {
									const search = v.toLocaleLowerCase();
									filteredTokensInWalletSet(
										tokensInWallet.filter((tokenApiInfo) => {
											return (
												tokenApiInfo.tokenAddress.includes(search) ||
												tokenApiInfo.name.toLocaleLowerCase().includes(search) ||
												addIndexToTokenSymbol(tokenApiInfo.symbol, tokenApiInfo.tokenIndex)
													.toLocaleLowerCase()
													.includes(search)
											);
										})
									);
								}
							}}
						/>
					</div>
					<div className="pb-4 px-5 mt-4 space-y-4 flex-1 overflow-scroll">
						<div className="h-px bg-white" />
						{!filteredTokensInWallet.length ? (
							<p className="leading-3 text-white text-center">{i18n.nothingFound}</p>
						) : (
							filteredTokensInWallet.map((tokenApiInfo) => (
								<TokenCard
									{...tokenApiInfo}
									key={tokenApiInfo.tokenAddress}
									onClick={() => tokenSendInfoSet(tokenApiInfo)}
								/>
							))
						)}
					</div>
				</Modal>
			)}
			{tokenSendInfo && (
				<SendTokenFlow
					selectedToken={tokenSendInfo}
					onClose={() => {
						sendingSet(false);
						tokenSendInfoSet(undefined);
					}}
				/>
			)}
			{viewingConnected && (
				<Modal bottom onClose={() => viewingConnectedSet(false)} className="flex flex-col">
					<div className="fy p-4">
						<p className="text-lg text-center">{i18n.vitePassportIsLinking}</p>
						<div className="mt-2 px-4 py-3 bg-skin-base rounded-full">
							<p className="leading-3 text-lg break-words">{hostname}</p>
						</div>
						<p className="mt-2">{contacts[activeAccount.address]}</p>
						<p className="font-medium text-sm">{shortenAddress(activeAccount.address)}</p>
						<Button
							theme="highlight"
							label={i18n.disconnect}
							className="mt-4"
							onClick={async () => {
								triggerInjectedScriptEvent({
									type: 'accountChange',
									payload: { activeAddress: undefined },
								});
								const { connectedDomains } = await getValue('connectedDomains');
								delete connectedDomains![activeAccount.address][hostname];
								setValue({ connectedDomains });
								setState({ connectedDomains });
								viewingConnectedSet(false);
							}}
						/>
					</div>
				</Modal>
			)}
		</TabContainer>
	);
};

export default connect(Home);
