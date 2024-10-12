import classNames from "classnames";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const { className, children, ...rest } = props;

        return (
            <button
                className={classNames("btn", className)}
                ref={ref}
                type="button"
                {...rest}
            >
                {children}
            </button>
        );
    },
);
