import { useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';
import CopyOutline from '../assets/copy';

type Props = State & {
	mnemonics: string;
	passphrase?: string;
	className?: string;
};

const Secrets = ({ i18n, mnemonics, copyWithToast, className }: Props) => {
	return (
		<div
			className={`relative overflow-hidden w-full bg-white rounded-xl shadow p-4 ${className}`}
		>
			<button className="fx leading-3 mb-2" onClick={() => copyWithToast(mnemonics)}>
				<p className="text-black mr-1">{i18n.mnemonicPhrase}</p>
				<CopyOutline size='16' />
			</button>
			<div className="grid grid-flow-col grid-rows-[repeat(12,minmax(0,1fr))]">
				{mnemonics.split(' ').map((word, i) => (
					<p key={i} className="text-black font-normal">
						<span>{i + 1}.</span> {word}
					</p>
				))}
			</div>
			{/* {passphrase && (
				<>
					<p className="mt-2 text-skin-secondary">{i18n.bip39Passphrase}</p>
					<p className="break-words">{passphrase}</p>
				</>
			)} */}
		</div>
	);
};

export default connect(Secrets);
