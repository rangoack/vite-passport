import { DownloadIcon, UploadIcon } from '@heroicons/react/outline';
import { DotsCircleHorizontalIcon } from '@heroicons/react/solid';
import { Transaction } from '@vite/vitejs/distSrc/accountBlock/type';
// import { AccountBlockBlock } from '@vite/vitejs/distSrc/utils/type';
import React, { useMemo, useState } from 'react';
import TransactionModal from '../components/TransactionModal';
import FetchWidget from '../containers/FetchWidget';
import { connect } from '../utils/global-context';
import { shortenAddress, toBiggestUnit } from '../utils/strings';
import { formatDate } from '../utils/time';
import { State } from '../utils/types';

type Props = State & {
	tti?: string;
	padding?: string;
};

const FETCH_AMOUNT = 10;

const TransactionList = ({
	viteApi,
	activeAccount,
	setState,
	i18n,
	transactionHistory,
	viteBalanceInfo,
	tti,
	padding = 'px-5 pb-4'
}: Props) => {
	const [txInfoModalTx, txInfoModalTxSet] = useState<undefined | Transaction>();
	const [ttiEndReached, ttiEndReachedSet] = useState(false);
	const transactions = useMemo(() => {
		if (tti) {
			return transactionHistory?.[tti];
		}
		return transactionHistory?.received && transactionHistory?.unreceived
			? [...transactionHistory.received, ...transactionHistory.unreceived]
			: undefined;
	}, [transactionHistory, tti]);
	const allUnreceivedTxsLoaded = useMemo(
		() =>
			ttiEndReached ||
			(viteBalanceInfo &&
				transactionHistory?.unreceived?.length === +viteBalanceInfo?.unreceived?.blockCount),
		[ttiEndReached, transactionHistory, viteBalanceInfo]
	);
	const allReceivedTxsLoaded = useMemo(
		() =>
			ttiEndReached ||
			(viteBalanceInfo &&
				transactionHistory?.received?.length === +viteBalanceInfo?.balance?.blockCount),
		[ttiEndReached, transactionHistory, viteBalanceInfo]
	);

	return (
		<div className={`flex-1 overflow-scroll ${padding}`}>
			<FetchWidget
				shouldFetch={!transactions && !!viteApi}
				getPromise={() => {
					if (tti) {
						return viteApi.request(
							'ledger_getAccountBlocks',
							activeAccount.address,
							null, // last tx hash
							tti,
							FETCH_AMOUNT
						);
					}
					return Promise.all([
						viteApi.request(
							'ledger_getUnreceivedBlocksByAddress',
							activeAccount.address,
							0,
							FETCH_AMOUNT
						),
						viteApi.request(
							'ledger_getAccountBlocksByAddress',
							activeAccount.address,
							0,
							FETCH_AMOUNT
						),
					]);
					// viteApi.getTransactionList(
					// 	{ address: activeAccount.address, pageIndex: 0, pageSize: 10 },
					// 	'all'
					// );
				}}
				onResolve={(data: any) => {
					// @ts-ignore
					// data?.[1]?.[0] && txInfoModalTxSet(data[1][0]);
					setState(
						{
							transactionHistory: tti
								? {
										[tti]: (data as Transaction[]) || [],
								  }
								: {
										unreceived: (data[0] as Transaction[]) || [],
										received: (data[1] as Transaction[]) || [],
								  },
						},
						{ deepMerge: true }
					);
				}}
			>
				{!transactions ? null : !transactions.length ? (
					<p className="text-white text-sm font-normal text-center">{i18n.noTransactionHistory}</p>
				) : (
					transactions.map((tx, i) => {
						const Icon =
							{
								2: UploadIcon,
								4: DownloadIcon,
							}[tx.blockType] || DotsCircleHorizontalIcon;
						return (
							// hide unreceived txs when viewing specific tokens (i.e. `tti` is truthy)
							<React.Fragment key={tx.hash}>
								{!tti && !!transactionHistory?.unreceived?.length && i === 0 && (
									<p className="text-sm font-normal">
										{viteBalanceInfo!.unreceived.blockCount} {i18n.unreceived}
									</p>
								)}
								{!tti && i === transactionHistory?.unreceived?.length && (
									<>
										{!allUnreceivedTxsLoaded && (
											<button
												className="mx-auto block text-sm text-white mt-3"
												onClick={async () => {
													const additionalTxs = await viteApi.request(
														'ledger_getUnreceivedBlocksByAddress',
														activeAccount.address,
														Math.ceil(transactionHistory.unreceived!.length / FETCH_AMOUNT),
														FETCH_AMOUNT
													);
													const unreceived = [...transactionHistory.unreceived!, ...additionalTxs];
													setState({ transactionHistory: { unreceived } }, { deepMerge: true });
												}}
											>
												{i18n.loadMore}
											</button>
										)}
										{!!transactionHistory.unreceived?.length && (
											<div className="h-px bg-white"></div>
										)}
										<p className="text-sm font-normal">
											{viteBalanceInfo!.balance.blockCount} {i18n.received}
										</p>
									</>
								)}
								<button
									className="fx text-sm rounded-xl w-full mt-3 p-3 shadow-t-2 bg-white"
									onClick={() => txInfoModalTxSet(tx)}
								>
									<div className="flex-1 flex justify-between">
										<div className="fx">
											<div className="h-5 w-5 rounded-full xy bg-gradient-to-r from-skin-highlight to-skin-lowlight">
												<Icon className="text-white w-4" />
											</div>
											<p className="ml-2 text-sm text-black font-normal">
												{toBiggestUnit(tx.amount!, +tx.tokenInfo!.decimals)}{' '}
												{tx.tokenInfo!.tokenSymbol}
											</p>
										</div>
										<div className="flex flex-col items-end font-medium">
											<p className="text-xs text-black font-normal">
												{shortenAddress(tx.blockType === 4 ? tx.fromAddress! : tx.toAddress!)}
											</p>
											<p className="text-xs text-black font-normal">{formatDate(+tx.timestamp!)}</p>
										</div>
									</div>
								</button>
								{!allReceivedTxsLoaded && i === transactions.length - 1 && (
									<button
										className="mx-auto block mt-3 text-sm text-white"
										onClick={async () => {
											if (tti) {
												const currentList = transactionHistory?.[tti];
												if (!currentList) return;
												const additionalTxs = (
													await viteApi.request(
														'ledger_getAccountBlocks',
														activeAccount.address,
														currentList[currentList.length - 1].hash,
														tti,
														FETCH_AMOUNT + 1
													)
												).slice(1);
												const list = [...currentList, ...additionalTxs];
												if (additionalTxs.length === 0) {
													// OPTIMIZE: save this globally so it doesn't reset on component mount
													ttiEndReachedSet(true);
												}
												return setState(
													{ transactionHistory: { [tti]: list } },
													{ deepMerge: true }
												);
											}
											const currentList = transactionHistory?.received;
											if (!currentList) return;
											const received = [
												...currentList,
												...(await viteApi.request(
													'ledger_getAccountBlocksByAddress',
													activeAccount.address,
													Math.ceil(currentList.length / FETCH_AMOUNT),
													FETCH_AMOUNT
												)),
											];
											setState({ transactionHistory: { received } }, { deepMerge: true });
										}}
									>
										{i18n.loadMore}
									</button>
								)}
							</React.Fragment>
						);
					})
				)}
				<TransactionModal transaction={txInfoModalTx} onBack={() => txInfoModalTxSet(undefined)} />
			</FetchWidget>
		</div>
	);
};

export default connect(TransactionList);
