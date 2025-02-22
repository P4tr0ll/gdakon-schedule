import { useMemo } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import { useTranslation } from "react-i18next";
import { flatMap, groupBy, keys, map, partition, values } from "lodash";
import { Box, Container, Typography } from "@mui/material";
import dayjs from "dayjs";

import { useNow } from "../../hooks/useNow";

import { useEventFilter } from "./EventFilter.Provider";
import { EventScheduleItemCard } from "./EventScheduleItemCard";
import { EventSearch } from "./Search/EventSearch";

import { EventScheduleItemModel } from "~modules/Schedule";

type VirtuosoProps<T> = {
    groupCounts: number[];
    groups: string[];
    items: T[];
};

export const EventListVirtualized = () => {
    const { t } = useTranslation("EventSchedule");
    const now = useNow();
    const { filtered = [] } = useEventFilter();

    const { groupCounts, groups, items } =
        useMemo((): VirtuosoProps<EventScheduleItemModel> => {
            const [expired, upcoming] = partition(filtered, (it) =>
                now.isAfter(it.endTime)
            );
            const groups = groupBy(upcoming, (it) =>
                dayjs(it.startTime).format("LL")
            );

            if (expired.length) {
                groups[t("Groups.expired")] = expired;
            }

            const groupCounts = map(groups, (values) => values.length);

            return {
                groupCounts: groupCounts,
                items: flatMap(values(groups)),
                groups: keys(groups),
            };
        }, [filtered]);

    return (
        <Box display={"flex"} flexDirection={"column"} flex={1}>
            <Container>
                <Box pt={3}>
                    <EventSearch />
                </Box>
            </Container>
            {items.length === 0 ? (
                <Box
                    display={"flex"}
                    flexDirection={"column"}
                    flex={1}
                    alignItems={"center"}
                    justifyContent={"center"}
                    gap={2}
                >
                    <Typography variant={"h5"}>
                        {t("Search.no_results")}
                    </Typography>
                </Box>
            ) : (
                <GroupedVirtuoso<EventScheduleItemModel>
                    groupCounts={groupCounts}
                    height={"100%"}
                    groupContent={(index) => (
                        <Container key={groups[index]}>
                            <Box
                                pt={2}
                                pb={2}
                                pl={2}
                                bgcolor={"background.paper"}
                            >
                                <Typography variant={"h5"}>
                                    {groups[index]}
                                </Typography>
                            </Box>
                        </Container>
                    )}
                    itemContent={(index, groupIndex) => {
                        const item = items[index];
                        return (
                            <Container
                                sx={{
                                    pb: 1,
                                    opacity:
                                        groups[groupIndex] ===
                                        t("Groups.expired")
                                            ? 0.4
                                            : 1,
                                }}
                                key={item.id}
                            >
                                <EventScheduleItemCard event={item} />
                            </Container>
                        );
                    }}
                />
            )}
        </Box>
    );
};
