import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import DeterministicIcon from '../components/DeterministicIcon';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { defaultTokenList, getTokenFuzzySearchApiUrl } from '../utils/constants';
import { connect } from '../utils/global-context';
import { debounceAsync, formatPrice, getTokenApiInfo } from '../utils/misc';
import { setValue } from '../utils/storage';
import {
	addIndexToTokenSymbol,
	normalizeTokenName,
	shortenAddress,
	toBiggestUnit,
	toQueryString,
} from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';
import FetchWidget from './FetchWidget';
import SendTokenFlow from './SendTokenFlow';
import TextInput, { useTextInputRef } from './TextInput';
import TokenCard from './TokenCard';
import TokenSearchBar from './TokenSearchBar';
import TransactionList from './TransactionList';
import CopyOutline from '../assets/copy';

const searchTokenApiInfo = debounceAsync<TokenApiInfo[]>((rpcURL: string, query: string) => {
	if (!query) {
		return [];
	}
	const url = getTokenFuzzySearchApiUrl(rpcURL, query);
	console.log('url:', url);
	return fetch(url)
		.then((res) => res.json())
		.then((data: { data: { VITE: TokenApiInfo[] } }) => data?.data?.VITE || []);
}, 300);

type Props = State;

const WalletContents = ({
	i18n,
	homePageTokenIdsAndNames,
	copyWithToast,
	activeAccount,
	activeNetwork,
	prices,
	setState,
	viteBalanceInfo,
	homePageTokens,
}: Props) => {
	const amountRef = useTextInputRef();
	const commentRef = useTextInputRef();
	const [checkedTokens, checkedTokensSet] = useState<{
		[tti: string]: boolean;
	}>({});
	const [selectedToken, selectedTokenSet] = useState<undefined | TokenApiInfo>();
	const [editingTokenList, editingTokenListSet] = useState(false);
	const [receivingFunds, receivingFundsSet] = useState(false);
	const [sendingFunds, sendingFundsSet] = useState(false);
	const [amount, amountSet] = useState('');
	const [comment, commentSet] = useState('');
	const [editTokenQuery, editTokenQuerySet] = useState('');
	const [availableTokens, availableTokensSet] = useState<undefined | TokenApiInfo[]>();
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);
	const getPromise = useCallback(
		() =>
			getTokenApiInfo(
				activeNetwork.rpcUrl,
				homePageTokenIdsAndNames.map(([tti]) => tti)
			),
		[activeNetwork.rpcUrl, homePageTokenIdsAndNames]
	);
	const onResolve = useCallback(
		(list: TokenApiInfo[]) => {
			setState({
				homePageTokens: list.sort((a, b) =>
					a.symbol === 'VITE' ? -1 : b.symbol === 'VITE' ? 1 : a.symbol < b.symbol ? -1 : 1
				),
			});
		},
		[setState]
	);

	useEffect(() => {
		if (homePageTokens && prices && viteBalanceInfo) {
			const balanceInfoMap = viteBalanceInfo
				? viteBalanceInfo?.balance?.balanceInfoMap || {}
				: undefined;
			setState({
				portfolioValue: homePageTokens.reduce((value, token) => {
					const balance = balanceInfoMap?.[token.tokenAddress]?.balance || '0';
					const biggestUnit = !balanceInfoMap ? null : toBiggestUnit(balance, token.decimal);
					const unitPrice = prices?.[normalizeTokenName(token.name)]?.usd;
					return value + +formatPrice(biggestUnit!, unitPrice);
				}, 0),
			});
		}
	}, [homePageTokens, setState, prices, viteBalanceInfo]);

	return (
		<>
			<FetchWidget
				noSpinnerMargin
				shouldFetch={
					!homePageTokens ||
					homePageTokens.length !== homePageTokenIdsAndNames.length ||
					!homePageTokens.every((token) =>
						homePageTokenIdsAndNames.find(([tti]) => tti === token.tokenAddress)
					) // used using `find` cuz getTokenApiInfo API doesn't return token info in order of homePageTokenIdsAndNames
				}
				getPromise={getPromise}
				onResolve={onResolve}
			>
				{homePageTokens && (
					<>
						{!homePageTokens.length ? (
							<p className="text-center text-slate-300 mb-5">{i18n.yourWalletIsEmpty}</p>
						) : (
							homePageTokens.map((tokenApiInfo) => (
								<TokenCard
									{...tokenApiInfo}
									key={tokenApiInfo.tokenAddress}
									onClick={() => selectedTokenSet(tokenApiInfo)}
								/>
							))
						)}
						<button
							className="mx-auto block text-black text-sm"
							onClick={() => {
								const checkedTokens: { [tti: string]: boolean } = {};
								homePageTokenIdsAndNames.forEach(([tti]) => (checkedTokens[tti] = true));
								checkedTokensSet(checkedTokens);
								availableTokensSet([
									...homePageTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
								editingTokenListSet(true);
							}}
						>
							{i18n.editTokenList}
						</button>
					</>
				)}
			</FetchWidget>
			{editingTokenList && (
				<Modal
					fullscreen
					heading={i18n.editTokenList}
					onClose={() => editingTokenListSet(false)}
					className="flex flex-col px-5"
				>
					<TokenSearchBar
						onUserInput={(v) => {
							editTokenQuerySet(v);
							if (availableTokens) {
								availableTokensSet(undefined);
							}
						if (!v) {
								availableTokensSet([
									...homePageTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
							}
						}}
					/>
					<div className="flex-1 overflow-scroll mt-6">
						<FetchWidget
							shouldFetch={!availableTokens}
							getPromise={() => searchTokenApiInfo(activeNetwork.rpcUrl, editTokenQuery)}
							onResolve={(list: TokenApiInfo[]) => availableTokensSet(list)}
							>
							{availableTokens &&
								(!availableTokens.length ? (
									<div className="xy min-h-8">
										<p className="text-white text-center">{i18n.nothingFound}</p>
									</div>
									) : (
										availableTokens.map((tokenApiInfo, i) => {
											const {
												symbol,
												// name,
												tokenAddress: tti,
												tokenIndex,
												icon,
												// decimal,
												// gatewayInfo,
												} = tokenApiInfo;
											// newlyAddedTokens
											const tokenName = addIndexToTokenSymbol(symbol, tokenIndex);
											return (
												<React.Fragment key={tti}>
													{(i === 0 || i === homePageTokenIdsAndNames.length) && (
														<div className={`h-px bg-white`} />
													)}
													<div className="fx rounded-sm py-2">
														{!icon ? (
															<DeterministicIcon tti={tti} className="h-8 w-8 rounded-full mr-2" />
															) : (
																<img
																	src={icon}
																	alt={tokenName}
																	className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-white"
																/>
														)}
														<div className="flex-1 fx">
															<div className="flex flex-col flex-1 items-start">
																<p className="text-sm font-normal">{tokenName}</p>
																<p className="text-xs text-white font-normal">{tti}</p>
															</div>
															<Checkbox
																radio
																value={checkedTokens[tti]}
																onUserInput={(checked) => {
																checkedTokens[tti] = checked;
																checkedTokensSet({ ...checkedTokens });
																}}
															/>
														</div>
													</div>
												</React.Fragment>
											);
										})
							))}
						</FetchWidget>
					</div>
					<div className="flex gap-4 z-50 mt-4">
						<Button theme="lowlight" label={i18n.cancel} onClick={() => editingTokenListSet(false)} />
						<Button
							theme="white"
							label={i18n.confirm}
							onClick={async () => {
								const displayedTokenIds = Object.entries(checkedTokens)
								.filter(([, checked]) => checked)
							.map(([tti]) => tti);
								const data: Pick<State, 'homePageTokenIdsAndNames'> = {
									homePageTokenIdsAndNames: (
										await getTokenApiInfo(activeNetwork.rpcUrl, displayedTokenIds)
									).map(({ tokenAddress, name }) => [tokenAddress, normalizeTokenName(name)]),
								};
								setState(data);
								setValue(data);
								editingTokenListSet(false);
							}}
						/>
					</div>

				</Modal>
			)}
			{selectedToken && (
				<Modal
					fullscreen
					onClose={() => selectedTokenSet(undefined)}
					className="flex flex-col flex-1"
					heading={addIndexToTokenSymbol(selectedToken.symbol, selectedToken.tokenIndex)}
					subheading={selectedToken.tokenAddress}
				>
					<div className="flex-1">
						<TransactionList tti={selectedToken.tokenAddress} padding='px-5 pb-4' />
					</div>
					<div className="fx gap-4 px-5 pt-3">
						<Button theme="lowlight" onClick={() => sendingFundsSet(true)} label={i18n.send} />
						<Button
							theme="white"
							onClick={() => receivingFundsSet(true)}
							label={i18n.receive}
						/>
					</div>
				</Modal>
			)}
			{receivingFunds && (
				<Modal noHeader onClose={() => receivingFundsSet(false)}>
					{!!selectedToken && (
						<div className="flex flex-col gap-y-4 p-4">
							<div className="xy gap-2 px-4 py-1.5 border border-skin-highlight rounded-full">
								<p className="text-sm text-skin-highlight">{shortenAddress(activeAccount.address)}</p>
								<button
									className="p-1.5 -m-1.5 xy"
									onClick={() => copyWithToast(activeAccount.address)}
								>
									<CopyOutline size="16" />
								</button>
							</div>
							<QR data={`vite:${activeAccount.address}`}/>

							<TextInput
								theme='black'
								optional
								numeric
								_ref={amountRef}
								label={i18n.amount}
								maxDecimals={selectedToken.decimal}
								value={amount}
								onUserInput={(v) => amountSet(v)}
							/>
							<TextInput
								theme='black'
								optional
								_ref={commentRef}
								label={i18n.comment}
								value={comment}
								onUserInput={(v) => commentSet(v)}
							/>
						</div>
					)}
				</Modal>
			)}
			{sendingFunds && (
				<SendTokenFlow
					selectedToken={selectedToken!}
					onClose={() => sendingFundsSet(false)}
					onCloseAfterSend={() => {
						sendingFundsSet(false);
						selectedTokenSet(undefined);
					}}
				/>
			)}
		</>
	);
};

export default connect(WalletContents);
