import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import { HTMLProps, useMemo, useRef, useState } from 'react';
import { connect } from '../utils/global-context';
import { State } from '../utils/types';

export type TextInputRefObject = {
	tag: HTMLElement | null;
	// errorSet: React.Dispatch<React.SetStateAction<string>>;
	readonly isValid: boolean;
	value: string;
	error: string;
};

export const useTextInputRef = () => {
	return useRef<TextInputRefObject>({
		tag: null,
		isValid: true,
		value: '',
		error: '',
	}).current;
};

type Props = State &
	HTMLProps<HTMLInputElement> & {
		label: string;
		_ref: TextInputRefObject;
		// _ref?: Function | React.MutableRefObject<TextInputRefObject | undefined>;
		onUserInput?: (value: string) => void;
		initialValue?: string;
		containerClassName?: string;
		inputClassName?: string;
		textarea?: boolean;
		numeric?: boolean;
		password?: boolean;
		resizable?: boolean;
		maxDecimals?: number;
		disabled?: boolean;
		onMetaEnter?: () => void;
		placeholder?: string;
		optional?: boolean;
		showPasswordRequirements?: boolean;
		maxLength?: number;
		getIssue?: (value: string) => string | void;
		onKeyDown?: (key: string) => void;
		compact?: boolean;
		theme?: 'white' | 'black';
	};

const normalizeNumericInput = (str: string, decimals: number, removeInsignificantZeros = false) => {
	if (Number.isNaN(+str) || !str) {
		return '';
	}
	let firstDotIndex = str.indexOf('.');
	if (firstDotIndex === -1) {
		firstDotIndex = str.length;
	}
	str = str.slice(0, firstDotIndex + decimals + 1);
	if (removeInsignificantZeros) {
		str = +str + '';
	}
	return str;
};

const TextInput = ({
	i18n,
	containerClassName,
	autoFocus,
	compact,
	inputClassName,
	textarea,
	numeric,
	password,
	showPasswordRequirements,
	initialValue,
	resizable,
	maxDecimals = 0,
	disabled,
	label,
	placeholder = '',
	onUserInput,
	optional,
	maxLength,
	getIssue = () => '',
	onKeyDown,
	_ref,
	theme = 'white'
}: Props) => {
	const input = useRef<HTMLInputElement | HTMLTextAreaElement | null>();
	const [internalValue, internalValueSet] = useState(initialValue || '');
	const [error, errorSet] = useState('');
	const [focused, focusedSet] = useState(false);
	const [visible, visibleSet] = useState(false);
	const id = useMemo(() => label.toLowerCase().replace(/\s+/g, '-'), [label]);
	const Tag = useMemo(() => (textarea ? 'textarea' : 'input'), [textarea]);
	const textColor = theme === 'white' ? 'text-white' : 'text-black';
	const bgColor = theme === 'white' ? 'bg-skin-highlight' : 'bg-black';
	const borderColor = theme === 'white' ? 'bg-white' : 'bg-black';

	return (
		<div className={`relative ${error ? 'pb-0.5' : ''} ${containerClassName}`}>
			<label
				htmlFor={id}
				onMouseDown={() => setTimeout(() => input.current!.focus(), 0)}
				className={
					compact
						? `absolute transition-all pt-0.5 w-[calc(100%-1.2rem)] duration-200 ${
								focused || internalValue
									? 'top-0.5 left-2 font-bold text-xs'
									: 'text-md top-2.5 left-2.5 font-medium'
						  } 
							${focused ? 'text-skin-highlight' : 'text-skin-input-label'} 
							text-skin-input-label ${textarea ? 'bg-skin-middleground' : ''}`
						: `${textColor} font-normal text-lg ${textarea ? '' : ''}`
				}
			>
				{label}
			</label>
			<Tag
				id={id}
				placeholder={placeholder}
				value={internalValue}
				disabled={disabled}
				autoFocus={autoFocus}
				autoComplete="off"
				className={
					compact
						? `px-2 pt-4 w-full text-lg block transition duration-200 border-2 rounded-sm ${
								password ? 'pr-10' : ''
						  } ${textarea ? 'bg-skin-middleground' : 'bg-skin-base'} ${
								focused
									? 'border-skin-lowlight shadow-md'
									: 'shadow ' + (error ? 'border-skin-error' : 'border-skin-divider')
						  } ${resizable ? 'resize-y' : 'resize-none'} ${inputClassName}`
						: `w-full bg-transparent ${textColor} text-lg ${textarea ? 'h-24 font-bold' : 'h-8'} ${
								resizable ? 'resize-y' : 'resize-none'
						  } ${password ? 'pr-8' : ''}`
				}
				type={password && !visible ? 'password' : 'text'}
				onFocus={() => {
					focusedSet(true);
					errorSet('');
				}}
				onBlur={({ target: { value } }) => {
					focusedSet(false);
					if (numeric && onUserInput) {
						value = normalizeNumericInput(value, maxDecimals, true);
						onUserInput(value);
					}
					internalValueSet(value);
				}}
				onKeyDown={(event) => {
					onKeyDown && onKeyDown(event.key);
				}}
				onChange={({ target: { value } }) => {
					// e.stopPropagation();
					// e.preventDefault();
					if (disabled) {
						return;
					}
					error && errorSet('');
					if (numeric && value) {
						// eslint-disable-next-line
						value = value.replace(/[^0123456789\.]/g, '');
						value = normalizeNumericInput(value, maxDecimals);
					}
					value = maxLength ? value.slice(0, maxLength) : value;
					if (onUserInput) {
						onUserInput(value);
					}
					internalValueSet(value);
				}}
				ref={(tag: HTMLInputElement | HTMLTextAreaElement | null) => {
					input.current = tag;
					_ref.tag = tag;
					Object.defineProperty(_ref, 'error', {
						get: () => error,
						set: (v) => errorSet(v),
					});
					Object.defineProperty(_ref, 'value', {
						get: () => internalValue,
						set: (v) => internalValueSet(v),
					});
					Object.defineProperty(_ref, 'isValid', {
						get() {
							const trimmedValue = internalValue.trim();
							if (!optional && !trimmedValue) {
								errorSet(i18n.thisFieldCannotBeBlank);
								return false;
							} else if (password) {
								if (
									internalValue.length < 8 ||
									!/[A-Z]/.test(internalValue) ||
									!/[0-9]/.test(internalValue)
								) {
									errorSet(i18n.invalidPassword);
									return false;
								}
							} else if (trimmedValue && getIssue) {
								const newIssue = getIssue(trimmedValue) || '';
								errorSet(newIssue);
								return !newIssue;
							}
							return true;
						},
					});
				}}
			/>
			{password && (
				<button
					className={`absolute ${
						compact ? 'right-3 top-4' : 'right-0 top-8'
					} h-7 w-7 p-1 transition duration-200 ${
						focused ? 'text-skin-lowlight' : 'text-skin-eye-icon'
					}`}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => {
						visibleSet(!visible);
						setTimeout(() => {
							// move cursor to end
							input.current!.setSelectionRange(internalValue.length, internalValue.length);
						}, 0);
					}}
				>
					{visible ? <EyeIcon className={textColor} /> : <EyeOffIcon className={textColor} />}
				</button>
			)}
			{!compact && (
				<div className={`h-px duration-200 ${borderColor}`} />
			)}
			{error && <p className="inline-block mt-1 p-[1px] text-sm leading-3 font-normal text-white bg-[#ff0062]">{error}</p>}
			{showPasswordRequirements && (
				<p className={ `mt-1 text-xs font-normal ${textColor}` }>
					{i18n.mustContainAtLeast8Characters1UppercaseLetterAnd1Number}
				</p>
			)}
		</div>
	);
};

export default connect(TextInput);
