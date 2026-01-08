import { cn } from "../lib/utils";

interface Props {
	angle?: number;
	size?: number;
	className?: string;
	style?: React.CSSProperties;
}

export function Hatch({
	size = 7,
	angle = 125,
	className,
	style,
	...props
}: Props & React.ComponentProps<"div">) {
	return (
		<div
			className={cn("size-full text-surface-subtle", className)}
			style={{
				backgroundImage: `repeating-linear-gradient(${angle}deg, transparent, transparent ${size - 1}px, currentColor ${size - 1}px, currentColor ${size}px)`,
				...style,
			}}
			{...props}
		/>
	);
}
