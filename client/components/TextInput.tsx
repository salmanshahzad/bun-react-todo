import classNames from "classnames";
import { type InputHTMLAttributes, forwardRef } from "react";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: string | undefined;
    label?: string | undefined;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    (props, ref) => {
        const { className, error, label, ...rest } = props;

        return (
            <label className="form-control w-full">
                {label && (
                    <div className="label">
                        <span className="label-text">{label}</span>
                    </div>
                )}
                <input
                    className={classNames(
                        "input",
                        "input-bordered",
                        { "input-error": !!error },
                        className,
                    )}
                    ref={ref}
                    {...rest}
                />
                {error && (
                    <div className="label">
                        <span className="label-text-alt text-red-400">
                            {error}
                        </span>
                    </div>
                )}
            </label>
        );
    },
);
