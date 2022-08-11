import React, { useCallback, useMemo, useState } from 'react';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import DeterministicIcon from '../components/DeterministicIcon';
import Modal from '../components/Modal';
import QR from '../components/QR';
import { defaultTokenList } from '../utils/constants';
import { connect } from '../utils/global-context';
import { debounce, getTokenApiInfo } from '../utils/misc';
import { setValue } from '../utils/storage';
import { addIndexToTokenSymbol, toQueryString } from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';
import FetchWidget from './FetchWidget';
import SendTxFlow from './SendTxFlow';
import TextInput, { useTextInputRef } from './TextInput';
import TokenCard from './TokenCard';
import TokenSearchBar from './TokenSearchBar';
import TransactionList from './TransactionList';

const searchTokenApiInfo = debounce((query: string, callback: (list: TokenApiInfo[]) => void) => {
	return fetch(`https://vitex.vite.net/api/v1/cryptocurrency/info/search?fuzzy=${query}`)
		.then((res) => res.json())
		.then((data: { data: { VITE: TokenApiInfo[] } }) => {
			// console.log('data:', data);
			callback(data?.data?.VITE || []);
		});
}, 300);

type Props = State;

const WalletContents = ({ i18n, displayedTokenIds, activeAccount, setState }: Props) => {
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
	// const [comment, commentSet] = useState('');
	const [comment, commentSet] = useState('test');
	const [displayedTokens, displayedTokensSet] = useState<undefined | TokenApiInfo[]>();
	const [availableTokens, availableTokensSet] = useState<undefined | TokenApiInfo[]>();
	const activeAddress = useMemo(() => activeAccount.address, [activeAccount]);
	const getPromise = useCallback(() => {
		return getTokenApiInfo(displayedTokenIds);
	}, [displayedTokenIds]);
	const onResolve = useCallback((list: TokenApiInfo[]) => {
		displayedTokensSet(
			list.sort((a, b) =>
				a.symbol === 'VITE' ? -1 : b.symbol === 'VITE' ? 1 : a.symbol < b.symbol ? -1 : 1
			)
		);
		// selectedTokenSet(list[0]);
	}, []);

	return (
		<>
			<FetchWidget
				shouldFetch={
					!displayedTokens ||
					displayedTokens.length !== displayedTokenIds.length ||
					!displayedTokens.every((token) => displayedTokenIds.includes(token.tokenAddress)) // used `includes` instead of just checking index cuz getTokenApiInfo API doesn't return token info in order of displayedTokenIds
				}
				getPromise={getPromise}
				onResolve={onResolve}
			>
				{!displayedTokens ? (
					<p className="text-center text-skin-secondary">{i18n.loading}...</p>
				) : (
					<>
						{!displayedTokens.length ? (
							<p className="text-center text-skin-secondary">{i18n.yourWalletIsEmpty}</p>
						) : (
							displayedTokens.map((tokenApiInfo) => (
								<TokenCard
									{...tokenApiInfo}
									key={tokenApiInfo.tokenAddress}
									onClick={() => selectedTokenSet(tokenApiInfo)}
								/>
							))
						)}
						<button
							className="mx-auto block text-skin-highlight brightness-button leading-3"
							onClick={() => {
								const checkedTokens: { [tti: string]: boolean } = {};
								displayedTokenIds.forEach((tti) => {
									checkedTokens[tti] = true;
								});
								checkedTokensSet(checkedTokens);
								availableTokensSet([
									...displayedTokens!,
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
					className="flex flex-col"
				>
					<TokenSearchBar
						onUserInput={(v) => {
							if (availableTokens !== null) {
								availableTokensSet(undefined);
							}
							if (!v) {
								availableTokensSet([
									...displayedTokens!,
									...defaultTokenList.filter(({ tokenAddress }) => !checkedTokens[tokenAddress]),
								]);
								return;
							}
							searchTokenApiInfo(v, (list: TokenApiInfo[]) => {
								// console.log('list:', list);
								availableTokensSet(list);
							});
						}}
					/>
					<div className="flex-1 overflow-scroll mt-4">
						{!availableTokens ? (
							<div className="xy min-h-8">
								<p className="text-skin-secondary text-center">{i18n.loading}...</p>
							</div>
						) : !availableTokens.length ? (
							<div className="xy min-h-8">
								<p className="text-skin-secondary text-center">{i18n.nothingFound}</p>
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
										{(i === 0 || i === displayedTokenIds.length) && (
											<div className={`h-0.5 bg-skin-divider mx-4 ${i === 0 ? '' : 'mt-2'}`}></div>
										)}
										<div className="fx rounded-sm py-2 px-4">
											{!icon ? (
												<DeterministicIcon tti={tti} className="h-8 w-8 rounded-full mr-2" />
											) : (
												<img
													src={icon}
													alt={tokenName}
													className="h-8 w-8 rounded-full mr-2 overflow-hidden bg-gradient-to-tr from-skin-eye-icon to-skin-bg-base"
												/>
											)}
											<div className="flex-1 fx">
												<div className="flex flex-col flex-1 items-start">
													<p className="text-lg">{tokenName}</p>
													<p className="text-xs text-skin-tertiary">{tti}</p>
												</div>
												<Checkbox
													radio
													value={checkedTokens[tti]}
													onUserInput={(checked) => {
														console.log('checked:', checked);
														checkedTokens[tti] = checked;
														checkedTokensSet({ ...checkedTokens });
													}}
												/>
											</div>
										</div>
									</React.Fragment>
								);
							})
						)}
					</div>
					<div className="flex gap-4 p-4 shadow z-50">
						<Button theme="white" label={i18n.cancel} onClick={() => editingTokenListSet(false)} />
						<Button
							theme="highlight"
							label={i18n.confirm}
							onClick={async () => {
								const displayedTokenIds = Object.entries(checkedTokens)
									.filter(([, checked]) => checked)
									.map(([tti]) => tti);
								const data = {
									displayedTokenIds,
									displayedTokenNames: (await getTokenApiInfo(displayedTokenIds)).map(({ name }) =>
										name.toLowerCase()
									),
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
						<TransactionList tti={selectedToken.tokenAddress} />
					</div>
					<div className="fx p-4 gap-4 shadow">
						<Button theme="white" onClick={() => sendingFundsSet(true)} label={i18n.send} />
						<Button
							theme="highlight"
							onClick={() => receivingFundsSet(true)}
							label={i18n.receive}
						/>
					</div>
				</Modal>
			)}
			{receivingFunds && (
				<Modal
					onClose={() => receivingFundsSet(false)}
					className="flex flex-col"
					heading={`${i18n.receive} ${selectedToken?.symbol}`}
					subheading={selectedToken?.tokenAddress}
				>
					{!!selectedToken && (
						<div className="flex-1 p-2 space-y-2 overflow-scroll bg-skin-base">
							{/* https://docs.vite.org/vite-docs/vep/vep-6.html */}
							<QR
								data={`vite:${activeAddress}${toQueryString({
									amount,
									tti: selectedToken.tokenAddress,
									data: btoa(comment).replace(/=+$/, ''),
								})}`}
							/>
							<TextInput
								optional
								numeric
								_ref={amountRef}
								label="Amount"
								value={amount}
								onUserInput={(v) => amountSet(v)}
							/>
							<TextInput
								optional
								textarea
								_ref={commentRef}
								label="Comment"
								value={comment}
								onUserInput={(v) => commentSet(v)}
							/>
						</div>
					)}
				</Modal>
			)}
			{sendingFunds && (
				<SendTxFlow selectedToken={selectedToken!} onClose={() => sendingFundsSet(false)} />
			)}
		</>
	);
};

export default connect(WalletContents);
