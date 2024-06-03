import { SearchIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

type Props = State & {
	onUserInput: (str: string) => void;
};

const TokenSearchBar = ({ i18n, onUserInput }: Props) => {
	const [value, valueSet] = useState('');
	return (
		<div className="fx z-10 rounded-full mt-0.5">
			<div className="absolute z-10 w-10 xy">
				<SearchIcon className="h-6 w-6 text-skin-highlight" />
			</div>
			<input
				placeholder={i18n.searchTokensBySymbolOrTti}
				value={value}
				className="h-8 pl-10 pr-2 w-full bg-white font-normal text-xs text-skin-highlight placeholder:text-skin-highlight"
				onChange={(e) => {
					valueSet(e.target.value);
					onUserInput(e.target.value);
				}}
			/>
		</div>
	);
};

export default connect(TokenSearchBar);
