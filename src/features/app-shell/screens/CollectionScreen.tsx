import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { CollectionCopyCard } from "@/components/CollectionCopyCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import {
  type CollectionFilters,
  type CollectionLinkageFilter,
  type CollectionQuery,
  type CollectionSortMode,
  listCollectionCopies,
  listCrates,
  listTags,
} from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

const defaultSort: CollectionSortMode = "recently_added";
const mediaTypeOptions = ["Vinyl", "CD", "Cassette", "Other"];
const conditionOptions = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];
const ratingOptions = [5, 4, 3, 2, 1];
const linkageOptions = [
  { label: "Linked", value: "linked" },
  { label: "Custom", value: "unlinked" },
] satisfies { label: string; value: Exclude<CollectionLinkageFilter, "all"> }[];
const sortOptions = [
  { label: "Recently added", value: "recently_added" },
  { label: "Title A-Z", value: "title_asc" },
  { label: "Artist A-Z", value: "artist_asc" },
  { label: "Year newest", value: "year_desc" },
  { label: "Year oldest", value: "year_asc" },
  { label: "Rating high", value: "rating_desc" },
] satisfies { label: string; value: CollectionSortMode }[];
type CollectionArrayFilterKey =
  "mediaTypes" | "conditionMedia" | "conditionSleeve" | "ratings" | "tagIds" | "crateIds";

export function CollectionScreen() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState<CollectionSortMode>(defaultSort);
  const [filters, setFilters] = useState<CollectionFilters>({
    mediaTypes: [],
    conditionMedia: [],
    conditionSleeve: [],
    ratings: [],
    tagIds: [],
    crateIds: [],
    linkage: "all",
  });

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const query = useMemo<CollectionQuery>(
    () => ({
      search,
      filters,
      sort,
    }),
    [filters, search, sort],
  );
  const hasActiveQuery = hasSearch(search) || getActiveFilterCount(filters) > 0;

  const { data, error, isLoading } = useAsyncData(async () => {
    const [copies, crates, tags] = await Promise.all([
      listCollectionCopies(query),
      listCrates(),
      listTags(),
    ]);

    return {
      copies,
      crateCount: crates.length,
      crates,
      tags,
    };
  }, [refreshKey, query]);

  const copies = data?.copies ?? [];
  const featuredCopy = hasActiveQuery ? copies[0] : (copies[2] ?? copies[0]);
  const shelfCopies = featuredCopy ? copies.filter((copy) => copy.id !== featuredCopy.id) : [];
  const highlyRatedCopies = copies.filter((copy) => copy.rating >= 4);
  const activeFilterCount = getActiveFilterCount(filters);

  function clearAll() {
    setSearch("");
    setSort(defaultSort);
    setFilters({
      mediaTypes: [],
      conditionMedia: [],
      conditionSleeve: [],
      ratings: [],
      tagIds: [],
      crateIds: [],
      linkage: "all",
    });
  }

  return (
    <Screen>
      <AppHeader title="Collection" subtitle="Your physical music, ready to browse" />
      <AnimatedAppear>
        <Text style={styles.title}>Browse by cover. Stay for the Copy.</Text>
        <Text style={styles.body}>
          Covers lead the scroll, while Copy details stay close enough to guide what gets played
          next.
        </Text>
        <Link href="/copy/new" style={styles.addLink}>
          Add Copy
        </Link>
      </AnimatedAppear>

      <AnimatedAppear delay={60}>
        <View style={styles.queryPanel}>
          <View style={styles.searchField}>
            <Ionicons color={colors.inkMuted} name="search" size={18} />
            <TextInput
              accessibilityLabel="Search collection"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder="Search Copies, artists, Tags, Crates"
              placeholderTextColor={colors.inkMuted}
              style={styles.searchInput}
              value={search}
            />
            {hasSearch(search) ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                onPress={() => setSearch("")}
              >
                <Ionicons color={colors.creamMuted} name="close-circle" size={18} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.queryActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setFiltersOpen((current) => !current)}
              style={styles.filterButton}
            >
              <Ionicons color={colors.cream} name="options-outline" size={17} />
              <Text style={styles.filterButtonText}>
                Filters & Sort{activeFilterCount ? ` (${activeFilterCount})` : ""}
              </Text>
            </Pressable>
            {hasActiveQuery || sort !== defaultSort ? (
              <Pressable accessibilityRole="button" onPress={clearAll} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear all</Text>
              </Pressable>
            ) : null}
          </View>

          {hasActiveQuery ? (
            <View style={styles.activeChips}>
              {hasSearch(search) ? (
                <ActiveChip label={`Search: ${search.trim()}`} onPress={() => setSearch("")} />
              ) : null}
              {renderActiveFilterChips(filters, data?.tags ?? [], data?.crates ?? [], setFilters)}
            </View>
          ) : null}

          {filtersOpen ? (
            <View style={styles.filterPanel}>
              <FilterSection title="Sort">
                {sortOptions.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    selected={sort === option.value}
                    onPress={() => setSort(option.value)}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Media">
                {mediaTypeOptions.map((mediaType) => (
                  <ChoiceChip
                    key={mediaType}
                    label={mediaType}
                    selected={filters.mediaTypes?.includes(mediaType) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "mediaTypes", mediaType))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Media condition">
                {conditionOptions.map((condition) => (
                  <ChoiceChip
                    key={condition}
                    label={condition}
                    selected={filters.conditionMedia?.includes(condition) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "conditionMedia", condition))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Sleeve condition">
                {conditionOptions.map((condition) => (
                  <ChoiceChip
                    key={condition}
                    label={condition}
                    selected={filters.conditionSleeve?.includes(condition) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "conditionSleeve", condition))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Rating">
                {ratingOptions.map((rating) => (
                  <ChoiceChip
                    key={rating}
                    label={`${rating}`}
                    selected={filters.ratings?.includes(rating) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "ratings", rating))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Tags">
                {(data?.tags ?? []).map((tag) => (
                  <ChoiceChip
                    key={tag.id}
                    color={tag.color}
                    label={tag.name}
                    selected={filters.tagIds?.includes(tag.id) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "tagIds", tag.id))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Crates">
                {(data?.crates ?? []).map((crate) => (
                  <ChoiceChip
                    key={crate.id}
                    label={crate.name}
                    selected={filters.crateIds?.includes(crate.id) ?? false}
                    onPress={() => setFilters(toggleFilter(filters, "crateIds", crate.id))}
                  />
                ))}
              </FilterSection>

              <FilterSection title="Source">
                {linkageOptions.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    selected={filters.linkage === option.value}
                    onPress={() =>
                      setFilters({
                        ...filters,
                        linkage: filters.linkage === option.value ? "all" : option.value,
                      })
                    }
                  />
                ))}
              </FilterSection>
            </View>
          ) : null}
        </View>
      </AnimatedAppear>

      {isLoading ? (
        <AnimatedAppear delay={90}>
          <EmptyState
            title="Loading local collection"
            body="Opening the SQLite shelf on this device."
          />
        </AnimatedAppear>
      ) : error ? (
        <AnimatedAppear delay={90}>
          <EmptyState title="Collection unavailable" body={error.message} />
        </AnimatedAppear>
      ) : featuredCopy ? (
        <AnimatedAppear delay={90}>
          <SectionHeader eyebrow="Featured Copy" title="Worth pulling today" />
          <CollectionCopyCard copy={featuredCopy} featured />
        </AnimatedAppear>
      ) : (
        <AnimatedAppear delay={90}>
          {hasActiveQuery ? (
            <EmptyState
              title="No matching Copies"
              body="Try a broader search or clear a few filters to open the shelf back up."
            />
          ) : (
            <EmptyState
              title="No Copies yet"
              body="When Copies arrive, this shelf will put artwork first and keep ownership context close by."
            />
          )}
        </AnimatedAppear>
      )}

      <AnimatedAppear delay={160}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{copies.length}</Text>
            <Text style={styles.statLabel}>Copies</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{data?.crateCount ?? 0}</Text>
            <Text style={styles.statLabel}>Crates</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{highlyRatedCopies.length}</Text>
            <Text style={styles.statLabel}>Rated 4+</Text>
          </View>
        </View>
      </AnimatedAppear>

      {shelfCopies.length ? (
        <>
          <SectionHeader eyebrow="On The Shelf" title="Artwork-first browsing" />
          <View style={styles.stack}>
            {shelfCopies.map((copy, index) => (
              <AnimatedAppear key={copy.id} delay={220 + index * 55}>
                <CollectionCopyCard copy={copy} />
              </AnimatedAppear>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.chipRow}>{children}</View>
    </View>
  );
}

function ChoiceChip({
  color,
  label,
  selected,
  onPress,
}: {
  color?: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.choiceChip,
        color
          ? {
              backgroundColor: `${color}18`,
              borderColor: `${color}55`,
            }
          : null,
        selected && styles.choiceChipSelected,
      ]}
    >
      <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActiveChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.activeChip}>
      <Text style={styles.activeChipText}>{label}</Text>
      <Ionicons color={colors.creamMuted} name="close" size={14} />
    </Pressable>
  );
}

function toggleFilter(
  filters: CollectionFilters,
  key: CollectionArrayFilterKey,
  value: string | number,
) {
  const currentValues = (Array.isArray(filters[key]) ? filters[key] : []) as (string | number)[];
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value];

  return {
    ...filters,
    [key]: nextValues,
  };
}

function hasSearch(search: string) {
  return search.trim().length > 0;
}

function getActiveFilterCount(filters: CollectionFilters) {
  return (
    (filters.mediaTypes?.length ?? 0) +
    (filters.conditionMedia?.length ?? 0) +
    (filters.conditionSleeve?.length ?? 0) +
    (filters.ratings?.length ?? 0) +
    (filters.tagIds?.length ?? 0) +
    (filters.crateIds?.length ?? 0) +
    (filters.linkage && filters.linkage !== "all" ? 1 : 0)
  );
}

function renderActiveFilterChips(
  filters: CollectionFilters,
  tags: { id: string; name: string }[],
  crates: { id: string; name: string }[],
  setFilters: (filters: CollectionFilters) => void,
) {
  const chips: ReactNode[] = [];

  addActiveArrayChips(chips, filters, "mediaTypes", "Media", setFilters);
  addActiveArrayChips(chips, filters, "conditionMedia", "Media", setFilters);
  addActiveArrayChips(chips, filters, "conditionSleeve", "Sleeve", setFilters);
  addActiveArrayChips(chips, filters, "ratings", "Rating", setFilters);
  addActiveRelationChips(chips, filters, "tagIds", "Tag", tags, setFilters);
  addActiveRelationChips(chips, filters, "crateIds", "Crate", crates, setFilters);

  if (filters.linkage && filters.linkage !== "all") {
    chips.push(
      <ActiveChip
        key="linkage"
        label={filters.linkage === "linked" ? "Linked" : "Custom"}
        onPress={() => setFilters({ ...filters, linkage: "all" })}
      />,
    );
  }

  return chips;
}

function addActiveArrayChips(
  chips: ReactNode[],
  filters: CollectionFilters,
  key: CollectionArrayFilterKey,
  prefix: string,
  setFilters: (filters: CollectionFilters) => void,
) {
  const values = Array.isArray(filters[key]) ? filters[key] : [];

  values.forEach((value) => {
    chips.push(
      <ActiveChip
        key={`${String(key)}-${value}`}
        label={`${prefix}: ${value}`}
        onPress={() => setFilters(toggleFilter(filters, key, value))}
      />,
    );
  });
}

function addActiveRelationChips<TKey extends "tagIds" | "crateIds">(
  chips: ReactNode[],
  filters: CollectionFilters,
  key: TKey,
  prefix: string,
  options: { id: string; name: string }[],
  setFilters: (filters: CollectionFilters) => void,
) {
  const values = filters[key] ?? [];

  values.forEach((value) => {
    chips.push(
      <ActiveChip
        key={`${key}-${value}`}
        label={`${prefix}: ${options.find((option) => option.id === value)?.name ?? value}`}
        onPress={() => setFilters(toggleFilter(filters, key, value))}
      />,
    );
  });
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.cream,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
    marginTop: spacing.md,
  },
  addLink: {
    ...typography.subheading,
    alignSelf: "flex-start",
    backgroundColor: colors.ember,
    borderRadius: 8,
    color: colors.night,
    marginTop: spacing.lg,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  queryPanel: {
    backgroundColor: colors.nightRaised,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  searchField: {
    alignItems: "center",
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    ...typography.body,
    color: colors.cream,
    flex: 1,
    minHeight: 48,
    paddingVertical: spacing.sm,
  },
  queryActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  filterButtonText: {
    ...typography.caption,
    color: colors.cream,
  },
  clearButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  clearButtonText: {
    ...typography.caption,
    color: colors.ember,
  },
  activeChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  activeChip: {
    alignItems: "center",
    backgroundColor: "rgba(210, 154, 90, 0.14)",
    borderColor: "rgba(210, 154, 90, 0.38)",
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  activeChipText: {
    ...typography.caption,
    color: colors.creamMuted,
  },
  filterPanel: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  filterSection: {
    gap: spacing.sm,
  },
  filterSectionTitle: {
    ...typography.caption,
    color: colors.ember,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  choiceChip: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  choiceChipSelected: {
    backgroundColor: "rgba(210, 154, 90, 0.16)",
    borderColor: colors.ember,
  },
  choiceChipText: {
    ...typography.caption,
    color: colors.creamMuted,
  },
  choiceChipTextSelected: {
    color: colors.cream,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  stat: {
    backgroundColor: colors.nightSoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  statValue: {
    ...typography.heading,
    color: colors.cream,
  },
  statLabel: {
    ...typography.caption,
    color: colors.inkMuted,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },
  stack: {
    gap: spacing.md,
  },
});
