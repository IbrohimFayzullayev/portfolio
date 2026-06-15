/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import * as runtime from "react/jsx-runtime";
import NextImage from "next/image";

import { Link } from "@/i18n/navigation";

/**
 * Velite compiles MDX to a function body string. We turn it back into a
 * component at runtime. This runs on the server (RSC) by default.
 */
function useMDXComponent(code: string) {
  const fn = new Function(code);
  return fn({ ...runtime }).default as React.ComponentType<{
    components?: Record<string, React.ComponentType<any>>;
  }>;
}

const components: Record<string, React.ComponentType<any>> = {
  a: ({ href = "", ...props }: React.ComponentProps<"a">) => {
    if (href.startsWith("/")) {
      return <Link href={href} {...props} />;
    }
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      />
    );
  },
  img: ({ src, alt = "", ...props }: React.ComponentProps<"img">) => (
    <NextImage
      src={String(src)}
      alt={alt}
      width={1280}
      height={720}
      className="rounded-lg border"
      {...(props as Record<string, unknown>)}
    />
  ),
};

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}
