import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { ArtworkTile } from "@/components/ArtworkTile";
import { CollectionCopyCard } from "@/components/CollectionCopyCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { getCrateWithCopies } from "@/db/repositories";
import { colors, radii, spacing, typography } from "@/design/tokens";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCrateArtwork } from "@/utils/crateArtwork";

type CrateDetailScreenProps = {
  crateId: string;
};

export function CrateDetailScreen({ crateId }: CrateDetailScreenProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((current) => current + 1);
    }, []),
  );

  const {
    data: crateGroup,
    error,
    isLoading,
  } = useAsyncData(() => getCrateWithCopies(crateId), [crateId, refreshKey]);

  if (isLoading) {
    return (
      <Screen>
        <AppHeader title="Crate" subtitle="Loading local Crate" showBack />
        <EmptyState title="Loading Crate" body="Reading this Crate from SQLite." />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <AppHeader title="Crate" subtitle="Local database error" showBack />
        <EmptyState title="Crate unavailable" body={error.message} />
      </Screen>
    );
  }

  if (!crateGroup) {
    return (
      <Screen>
        <AppHeader title="Crate" subtitle="Missing local Crate" showBack />
        <EmptyState title="Crate not found" body="Return to Crates and choose another Crate." />
      </Screen>
    );
  }

  const { crate, copies } = crateGroup;
  const artwork = getCrateArtwork(crate, copies);

  return (
    <Screen>
      <AppHeader title="Crate" subtitle={`${copies.length} Copies`} showBack />
      <AnimatedAppear>
        <View style={styles.hero}>
          <View style={styles.artworkStack}>
            {artwork.map((swatch, index) => (
              <ArtworkTile key={`${crate.id}-${index}`} artwork={swatch} size="md" />
            ))}
          </View>
          <Text style={styles.title}>{crate.name}</Text>
          {crate.description ? <Text style={styles.body}>{crate.description}</Text> : null}
          <View style={styles.actionRow}>
            <Link
              href={{
                pathname: "/crate/[id]/edit",
                params: { id: crate.id },
              }}
              style={styles.primaryLink}
            >
              Edit Crate
            </Link>
          </View>
        </View>
      </AnimatedAppear>

      {copies.length ? (
        <AnimatedAppear delay={120}>
          <SectionHeader eyebrow="Copies" title="Gathered here" />
          <View style={styles.stack}>
            {copies.map((copy) => (
              <CollectionCopyCard key={copy.id} copy={copy} />
            ))}
          </View>
        </AnimatedAppear>
      ) : (
        <AnimatedAppear delay={120}>
          <EmptyState
            title="No Copies in this Crate"
            body="Edit this Crate to gather Copies around a mood, memory, or purpose."
          />
        </AnimatedAppear>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.nightRaised,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  artworkStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.cream,
  },
  body: {
    ...typography.body,
    color: colors.creamMuted,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
  },
  primaryLink: {
    ...typography.subheading,
    alignSelf: "flex-start",
    backgroundColor: colors.ember,
    borderRadius: radii.md,
    color: colors.night,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stack: {
    gap: spacing.md,
  },
});
