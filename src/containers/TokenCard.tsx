/* eslint-disable */

import { useMemo } from 'react';
import DeterministicIcon from '../components/DeterministicIcon';
import { connect } from '../utils/global-context';
import { formatPrice } from '../utils/misc';
import {
	addIndexToTokenSymbol,
	normalizeTokenName,
	shortenTti,
	toBiggestUnit,
} from '../utils/strings';
import { State, TokenApiInfo } from '../utils/types';

type Props = State &
	TokenApiInfo & {
		onClick?: () => void;
	};

const TokenCard = ({
	prices,
	currencyConversion,
	viteBalanceInfo,
	onClick,
	symbol,
	name,
	tokenAddress: tti,
	tokenIndex,
	icon,
	decimal,
	i18n,
}: Props) => {
	const balanceInfoMap = useMemo(
		() => (viteBalanceInfo ? viteBalanceInfo?.balance?.balanceInfoMap || {} : undefined),
		[viteBalanceInfo]
	);
	const balance = balanceInfoMap?.[tti]?.balance || '0';
	const biggestUnit = !balanceInfoMap ? null : toBiggestUnit(balance, decimal);
	const Tag = useMemo(() => (onClick ? 'button' : 'div'), [onClick]);
	const unitPrice = useMemo(() => prices?.[normalizeTokenName(name)]?.usd, [prices, name]);

	return (
		<Tag className="fx rounded-xl w-full px-3 py-4 mb-3 bg-white shadow-t-2" onClick={onClick}>
			{!icon ? (
				<DeterministicIcon tti={tti} className="h-10 w-10 rounded-full" />
			) : (
				<img
					src={icon}
					alt={addIndexToTokenSymbol(symbol, tokenIndex)}
					className="h-10 w-10 rounded-full"
				/>
			)}
			<div className="ml-4 flex-1 flex">
				<div className="flex flex-col flex-1 items-start">
					<p className="text-lg text-black font-normal">{addIndexToTokenSymbol(symbol, tokenIndex)}</p>
					<p className="text-xs text-black font-normal">{shortenTti(tti)}</p>
				</div>
				<div className="flex flex-col items-end mr-1.5">
					<p className="text-lg text-black font-normal">{biggestUnit === null ? '...' : biggestUnit}</p>
					{currencyConversion && (
						<p className="text-xs text-black font-normal">
							{!prices || biggestUnit === null
								? '...'
								: !unitPrice
								? i18n.noPrice
								: `≈${formatPrice(biggestUnit!, unitPrice, '$')}`}
						</p>
					)}
				</div>
			</div>
		</Tag>
	);
};

export default connect(TokenCard);
