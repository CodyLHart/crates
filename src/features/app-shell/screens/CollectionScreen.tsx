import { StyleSheet, Text, View } from "react-native";

import { AnimatedAppear } from "@/components/AnimatedAppear";
import { AppHeader } from "@/components/AppHeader";
import { CollectionCopyCard } from "@/components/CollectionCopyCard";
import { EmptyState } from "@/components/EmptyState";
import { Screen } from "@/components/Screen";
import { SectionHeader } from "@/components/SectionHeader";
import { crates, demoCopies } from "@/constants/demoData";
import { colors, spacing, typography } from "@/design/tokens";

const featuredCopy = demoCopies[2];
const shelfCopies = featuredCopy ? demoCopies.filter((copy) => copy.id !== featuredCopy.id) : [];
const highlyRatedCopies = demoCopies.filter((copy) => copy.rating >= 4);

export function CollectionScreen() {
  return (
    <Screen>
      <AppHeader title="Collection" subtitle="Your physical music, ready to browse" />
      <AnimatedAppear>
        <Text style={styles.title}>Browse by cover. Stay for the Copy.</Text>
        <Text style={styles.body}>
          Covers lead the scroll, while Copy details stay close enough to guide what gets played
          next.
        </Text>
      </AnimatedAppear>

      {featuredCopy ? (
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
            <Text style={styles.statValue}>{demoCopies.length}</Text>
            <Text style={styles.statLabel}>Copies</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{crates.length}</Text>
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
