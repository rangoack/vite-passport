import { DocumentDuplicateIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import AccountBlockClass from '@vite/vitejs/distSrc/accountBlock/accountBlock';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import { useEffect, useMemo, useState } from 'react';
import { connect } from '../utils/global-context';
import { getTokenApiInfo } from '../utils/misc';
import {
	addIndexToTokenSymbol,
	shortenAddress,
	shortenHash,
	shortenString,
	toBiggestUnit,
} from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';
import A from './A';
import Button from './Button';
import DeterministicIcon from './DeterministicIcon';
import Modal from './Modal';

type Props = State & {
	noBackArrow?: boolean;
	transaction?: Transaction;
	contractFuncParams?: any[];
	onBack?: () => void; // clicking back arrow
	onCancel?: () => void; // clicking Cancel
	onCloseAfterSend?: () => void; // clicking Close after tx is confirmed/sent
	unsentBlock?: AccountBlockClass;
};

const Field = ({
	label,
	value,
	format,
	onCopy,
}: {
	label: string;
	value?: string;
	format?: (v: string) => string;
	onCopy?: (v: string) => void;
}) =>
	!value ? null : (
		<div className="fx">
			<p className="leading-5 font-medium">
				<span className="text-skin-secondary">{label}: </span>
				{format ? format(value) : value}
			</p>
			{!!format && (
				<button className="ml-2" onClick={!onCopy ? undefined : () => onCopy(value)}>
					<DocumentDuplicateIcon className="w-5 text-skin-tertiary" />
				</button>
			)}
		</div>
	);

const TransactionModal = ({
	noBackArrow,
	unsentBlock,
	onBack,
	onCancel = onBack,
	onCloseAfterSend = onCancel,
	i18n,
	transaction,
	contractFuncParams,
	toastError,
	copyWithToast,
	viteApi,
	activeAccount,
	transactionHistory,
	setState,
	triggerInjectedScriptEvent,
	networkList,
	activeNetworkIndex,
}: Props) => {
	const [sentTx, sentTxSet] = useState<undefined | AccountBlockBlock>();
	const [tokenApiInfo, tokenApiInfoSet] = useState<undefined | TokenApiInfo>();
	const [sendingTx, sendingTxSet] = useState(false);

	const {
		address,
		fromAddress,
		amount,
		blockType,
		data,
		// difficulty,
		// fee,
		hash,
		height,
		// nonce,
		// previousHash,
		// publicKey,
		// sendBlockHash,
		// signature,
		// @ts-ignore
		_toAddress,
		// accountBlock.createAccountBlock returns a block with _toAddress instead of toAddress idk y
		toAddress = _toAddress,
		tokenId,
	} = {
		...transaction,
		...sentTx,
		...unsentBlock,
	};
	console.log('transaction:', transaction);

	const activeNetwork = useMemo(
		() => networkList[activeNetworkIndex],
		[networkList, activeNetworkIndex]
	);

	useEffect(() => {
		(async () => {
			if (tokenId) {
				const info = await getTokenApiInfo(tokenId);
				if (info.length === 1) {
					tokenApiInfoSet(info[0]);
				}
			}
		})();
	}, [tokenId]);
	const tokenName = useMemo(
		() =>
			!tokenApiInfo ? '' : addIndexToTokenSymbol(tokenApiInfo.symbol, tokenApiInfo.tokenIndex),
		[tokenApiInfo]
	);

	return (
		<>
			{(!!transaction || !!unsentBlock) && (
				<Modal
					fullscreen
					noBackArrow={noBackArrow || sendingTx}
					heading={unsentBlock ? i18n.confirmTransaction : i18n.transaction}
					onClose={() => onBack && onBack()}
					className="flex flex-col"
				>
					<div className="flex-1 px-4">
						{!tokenApiInfo ? (
							<div className="xy min-h-8">
								<p className="text-skin-secondary text-center">{i18n.loading}...</p>
							</div>
						) : (
							<>
								<p className="">
									{
										{
											1: i18n.contractCreation, // request(create contract)
											2: i18n.send, // request(transfer)
											3: i18n.reissueToken, // request(re-issue token)
											4: i18n.receive, // response
											5: i18n.failedResponse, // response(failed)
											6: i18n.contractRefund, // request(refund by contract)
											7: i18n.genesis, // response(genesis)
										}[blockType!]
									}
								</p>
								<div className="flex flex-col mt-4 gap-4 p-4 bg-skin-middleground">
									<div className="fx">
										<div className="fx">
											<p className="leading-5 break-words font-medium">
												<span className="text-skin-secondary">{i18n.token}: </span>
												{tokenName}
											</p>
											{!tokenApiInfo?.icon ? (
												<DeterministicIcon tti={tokenId!} className="h-5 w-5 rounded-full ml-2" />
											) : (
												<img
													src={tokenApiInfo?.icon}
													// alt={tokenApiInfo.symbol}
													alt={tokenName}
													className="h-5 w-5 rounded-full ml-2 overflow-hidden bg-gradient-to-tr from-skin-eye-icon to-skin-bg-base"
												/>
											)}
										</div>
									</div>
									<Field
										label={i18n.amount}
										value={toBiggestUnit(amount!, tokenApiInfo?.decimal)}
									/>
									<Field
										label={i18n.params}
										// @ts-ignore
										value={contractFuncParams}
										// format={(v) => JSON.stringify(v, null, 2)}
										format={shortenString}
										onCopy={copyWithToast}
									/>
									{(
										[
											[i18n.from, fromAddress || address, shortenAddress],
											[i18n.to, toAddress, shortenAddress],
											[i18n.data, data, shortenString],
											// [i18n.difficulty, difficulty],
											// [i18n.fee, fee],
											[i18n.hash, hash, shortenHash],
											[i18n.blockHeight, height],
											// [i18n.nonce, nonce],
											// [i18n.previousHash, previousHash, shortenHash],
											// [i18n.publicKey, publicKey],
											// [i18n.sendBlockHash, sendBlockHash, shortenHash],
											// [i18n.signature, signature],
										] as [string, string, () => string][]
									).map(([key, value, format]) => (
										<Field
											key={key}
											label={key}
											value={value}
											format={format}
											onCopy={copyWithToast}
										/>
									))}
								</div>
								{hash && (
									<A
										className="fx self-center mt-5"
										// OPTIMIZE: Make this URL more flexible for different network URLs
										href={`${activeNetwork.explorerUrl}/tx/${hash}`}
									>
										<p className="text-skin-lowlight">{i18n.viewOnViteScan}</p>
										<ExternalLinkIcon className="w-6 ml-1 mr-2 text-skin-lowlight" />
									</A>
								)}
							</>
						)}
					</div>
					{!!unsentBlock && (
						<div className="flex p-4 gap-4">
							{sentTx ? (
								<Button theme="highlight" label={i18n.close} onClick={onCloseAfterSend!} />
							) : (
								<>
									<Button
										disabled={!!sendingTx}
										theme="foreground"
										label={i18n.cancel}
										onClick={onCancel!}
									/>
									<Button
										disabled={!!sendingTx}
										theme="highlight"
										label={i18n.confirm}
										onClick={async () => {
											try {
												sendingTxSet(true);
												// await vitePassport.writeAccountBlock('send', {
												// address: 'vite_2daedeee8d0a41085dee136e36052f48d8e6122b9fec075639',
												// toAddress: 'vite_f30697191707a723c70d0652ab80304195e5928dcf71fcab99',
												// tokenId: 'tti_5649544520544f4b454e6e40',
												// amount: 1 + '0'.repeat(17), // 0.1 VITE
												// });

												unsentBlock.setProvider(viteApi);
												unsentBlock.setPrivateKey(activeAccount.privateKey);
												await unsentBlock.autoSetPreviousAccountBlock();
												unsentBlock.sign(activeAccount.privateKey);
												const res: AccountBlockBlock = await unsentBlock.autoSendByPoW();
												sentTxSet(res);

												if (transactionHistory?.received) {
													setState(
														{
															transactionHistory: {
																received: [res as Transaction, ...transactionHistory.received],
															},
														},
														{ deepMerge: true }
													);
												}

												const sanitizedBlock: AccountBlockBlock = {
													// Don't want to send `block: res` in case the type of `res` changes and includes `privateKey`
													// This ensures the private key is never sent to the content script
													blockType: res.blockType,
													address: res.address,
													fee: res.fee,
													data: res.data,
													sendBlockHash: res.sendBlockHash,
													toAddress: res.toAddress,
													tokenId: res.tokenId,
													amount: res.amount,
													height: res.height,
													previousHash: res.previousHash,
													difficulty: res.difficulty,
													nonce: res.nonce,
													signature: res.signature,
													publicKey: res.publicKey,
													hash: res.hash,
												};
												triggerInjectedScriptEvent({
													type: 'writeAccountBlock',
													payload: { block: sanitizedBlock },
												});
											} catch (e) {
												console.log('error:', e);
												toastError(e);
												sendingTxSet(false);
											}
										}}
									/>
								</>
							)}
						</div>
					)}
				</Modal>
			)}
		</>
	);
};

export default connect(TransactionModal);
