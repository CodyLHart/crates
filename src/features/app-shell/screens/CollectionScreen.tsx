import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { CollectionCopyCard } from "@/components/CollectionCopyCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { listCopies, listCratesWithCopies } from "@/db/repositories";
import { colors, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";

export function CollectionScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const { data, error, isLoading } = useAsyncData(async () => {
    const [copies, crateGroups] = await Promise.all([listCopies(), listCratesWithCopies()]);

    return {
      copies,
      crateCount: crateGroups.length,
    };
  }, [refreshKey]);

  const copies = data?.copies ?? [];
  const featuredCopy = copies[2] ?? copies[0];
  const shelfCopies = featuredCopy ? copies.filter((copy) => copy.id !== featuredCopy.id) : [];
  const highlyRatedCopies = copies.filter((copy) => copy.rating >= 4);

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
          <EmptyState
            title="No Copies yet"
            body="When Copies arrive, this shelf will put artwork first and keep ownership context close by."
          />
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
