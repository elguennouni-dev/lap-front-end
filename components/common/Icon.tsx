import React from "react";

interface BaseIconProps {
  name: string;
}

/**
 * IconProps can be either:
 *  - SVG props (for svg icons)
 *  - IMG props (for image icons like logo)
 */
type IconProps =
  | (BaseIconProps & React.SVGProps<SVGSVGElement>)
  | (BaseIconProps & React.ImgHTMLAttributes<HTMLImageElement>);

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  switch (name) {

    /** -----------------------------------------------------------
     * LOGO (IMAGE)
     * -----------------------------------------------------------*/
    case "logo":
      return (
        <img
          {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
          src="https://raw.githubusercontent.com/elguennouni-dev/lap-front-end/main/assets/lap_logo.png"
          alt="logo"
        />
      );

    /** -----------------------------------------------------------
     * LOGOUT
     * -----------------------------------------------------------*/
    case "logout":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * USER
     * -----------------------------------------------------------*/
    case "user":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * ORDER
     * -----------------------------------------------------------*/
    case "order":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * NOTIFICATION
     * -----------------------------------------------------------*/
    case "notification":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * DASHBOARD
     * -----------------------------------------------------------*/
    case "dashboard":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * KEY
     * -----------------------------------------------------------*/
    case "key":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 016-6h4a6 6 0 016 6z"
          />
        </svg>
      );

    /** -----------------------------------------------------------
     * MAIL
     * -----------------------------------------------------------*/
    case "mail":
      return (
        <svg
          {...(props as React.SVGProps<SVGSVGElement>)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );

    default:
      return null;
  }
};
