"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { AwardIcon, ChartPieIcon, LeafIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

import { match } from "@/utils/url-match";
import { useInsight } from "@/features/admin/insight/hooks";
import { AxiosError } from "axios";
import { useLocalizedPath } from "@/utils/locale";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const params = useParams<{ lang?: string }>();
    const rawLocale = params?.lang;

    const locale = useMemo(() => {
        const raw = rawLocale;

        if (Array.isArray(raw)) {
            return raw[0] ?? "ko";
        }

        return raw ?? "ko";
    }, [rawLocale]);

    const adminBasePath = `/${locale}/admin`;

    const items = useMemo(
        () => [
            {
                title: "인사이트",
                url: `${adminBasePath}/insight`,
                icon: ChartPieIcon,
            },
            {
                title: "회원 관리",
                url: `${adminBasePath}/user`,
                icon: UserIcon,
            },
            {
                title: "시즌 관리",
                url: `${adminBasePath}/season`,
                icon: LeafIcon,
            },
            {
                title: "지분 광고",
                url: `${adminBasePath}/ads`,
                icon: AwardIcon,
            },
        ],
        [adminBasePath]
    );

    const normalizedPath = useMemo(() => {
        if (!pathname) {
            return "";
        }

        return pathname.endsWith("/") && pathname !== "/"
            ? pathname.slice(0, -1)
            : pathname;
    }, [pathname]);

    const isActivePath = (target: string) => {
        const normalizedTarget = target.endsWith("/")
            ? target.slice(0, -1)
            : target;

        return (
            normalizedPath === normalizedTarget ||
            normalizedPath.startsWith(`${normalizedTarget}/`)
        );
    };

    const activeItem = items.find((item) => isActivePath(item.url));

    const getLocalizedPath = useLocalizedPath();
    const router = useRouter();
    const insightQuery = useInsight();

    if (match(pathname, "/regex:[a-z]{2}/admin")) {
        return children;
    }

    if (
        ((insightQuery.error as AxiosError<{ error: string }>)?.response?.data
            .error === "Unauthorized" ||
            (insightQuery.error as AxiosError<{ error: string }>)?.response
                ?.data.error === "Bad Request") &&
        !match(pathname, "/regex:[a-z]{2}/admin")
    ) {
        router.push(getLocalizedPath("/admin"));
        return;
    }

    return (
        <SidebarProvider>
            <Sidebar collapsible="offcanvas">
                <SidebarHeader>
                    <div className="flex items-center gap-2 rounded-md bg-sidebar-accent/60 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-accent-foreground">
                        <span>삼각게임</span>
                    </div>
                    <SidebarSeparator />
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>관리자 메뉴</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActivePath(item.url)}
                                            tooltip={item.title}
                                            aria-current={
                                                isActivePath(item.url)
                                                    ? "page"
                                                    : undefined
                                            }
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-sm font-semibold text-muted-foreground">
                            {activeItem?.title ?? "관리자 콘솔"}
                        </h1>
                    </div>
                </header>
                <div className="flex flex-1 flex-col overflow-auto px-4 py-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
