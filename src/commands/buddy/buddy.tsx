import React, { useEffect, useState } from 'react';
import { Box, Text } from '../../ink.js';
import type { LocalJSXCommandCall } from '../../types/command.js';
import { getGlobalConfig, saveGlobalConfig } from '../../utils/config.js';
import { companionUserId, getCompanion, roll } from '../../buddy/companion.js';
import { RARITY_STARS, type Companion, type StatName, STAT_NAMES } from '../../buddy/types.js';
import { renderFace, renderSprite } from '../../buddy/sprites.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { useSetAppState } from '../../state/AppState.js';

const H = '♥';

function statBar(value: number, width = 20): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

const RARITY_COLORS: Record<Companion['rarity'], string> = {
  common: 'inactive',
  uncommon: 'success',
  rare: 'permission',
  epic: 'autoAccept',
  legendary: 'warning',
};

function CompanionCard({ companion }: { companion: Companion }) {
  const sprite = renderSprite(companion, 0);

  return (
    <Box flexDirection="column" padding={1}>
      <Box flexDirection="row">
        <Box flexDirection="column" marginRight={2}>
          {sprite.map((line, i) => (
            <Text key={i} color={RARITY_COLORS[companion.rarity]}>
              {line}
            </Text>
          ))}
        </Box>
        <Box flexDirection="column">
          <Text bold color={RARITY_COLORS[companion.rarity]}>
            {companion.name} {RARITY_STARS[companion.rarity]}
          </Text>
          <Text dimColor>
            {companion.species} {companion.shiny ? '✨' : ''}
          </Text>
          <Text dimColor>Hatched: {new Date(companion.hatchedAt).toLocaleDateString()}</Text>
          <Text dimColor>Personality: {companion.personality}</Text>
        </Box>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        <Text bold>Stats:</Text>
        {STAT_NAMES.map(stat => (
          <Box key={stat} flexDirection="row">
            <Text width={12}>{stat}:</Text>
            <Text>{statBar(companion.stats[stat])}</Text>
            <Text> {companion.stats[stat]}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function HatchView({ onDone }: { onDone: (result: string) => void }) {
  const [step, setStep] = useState(0);
  const userId = companionUserId();
  const { bones, inspirationSeed } = roll(userId);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1500),
      setTimeout(() => {
        const names = ['Pixel', 'Byte', 'Noodle', 'Squish', 'Mochi', 'Bloop', 'Ziggy', 'Wobble'];
        const name = names[Math.floor(Math.random() * names.length)];
        const personalities = ['curious', 'sleepy', 'mischievous', 'loyal', 'goofy', 'wise'];
        const personality = personalities[Math.floor(Math.random() * personalities.length)];

        const stored = {
          name,
          personality,
          hatchedAt: Date.now(),
        };

        saveGlobalConfig(config => ({ ...config, companion: stored }));
        setStep(4);

        setTimeout(() => {
          onDone(`\n${H} Your companion ${name} has hatched! Say hi with /buddy`);
        }, 2000);
      }, 2000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const eggs = ['🥚', '🥚', '✨', '🐣'];

  return (
    <Box flexDirection="column" alignItems="center" padding={1}>
      <Text bold>{step < 4 ? 'Something is hatching...' : 'A new friend emerges!'}</Text>
      <Box marginY={1}>
        <Text>{eggs[Math.min(step, 3)]}</Text>
      </Box>
      {step === 4 && <Text color="success">Welcome to the world! {H}</Text>}
    </Box>
  );
}

function PetView({ onDone }: { onDone: () => void }) {
  const setAppState = useSetAppState();
  const [frame, setFrame] = useState(0);

  const hearts = [
    `     ${H}      ${H}     `,
    `    ${H}  ${H}    ${H}  ${H}    `,
    `   ${H}    ${H}  ${H}    ${H}   `,
    `  ${H}  ${H}      ${H}  ${H}  `,
    ` ${H}                    ${H} `,
  ];

  useEffect(() => {
    // Trigger pet animation in app state
    setAppState(s => ({ ...s, companionPetAt: Date.now() }));

    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, 200);

    const timeout = setTimeout(() => {
      onDone();
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onDone, setAppState]);

  const companion = getCompanion();
  if (!companion) return null;

  const heartLine = hearts[frame % hearts.length];
  const sprite = renderSprite(companion, 0);

  return (
    <Box flexDirection="column" alignItems="center" padding={1}>
      <Text color="autoAccept">{heartLine}</Text>
      {sprite.map((line, i) => (
        <Text key={i} color={RARITY_COLORS[companion.rarity]}>
          {line}
        </Text>
      ))}
      <Text color="autoAccept">{heartLine}</Text>
      <Text italic dimColor>
        {companion.name} seems happy!
      </Text>
    </Box>
  );
}

export const call: LocalJSXCommandCall = async (onDone, _context, args) => {
  const config = getGlobalConfig();
  const companion = getCompanion();
  const [subcommand, ...rest] = args.trim().split(/\s+/);

  // No subcommand - show info or help
  if (!subcommand) {
    if (!companion) {
      onDone('No companion yet! Use `/buddy hatch` to get your first buddy.', { display: 'system' });
      return null;
    }

    return <CompanionCard companion={companion} />;
  }

  switch (subcommand.toLowerCase()) {
    case 'hatch':
      if (companion) {
        onDone(`You already have a companion: ${companion.name} the ${companion.species}!`, { display: 'system' });
        return null;
      }
      return <HatchView onDone={result => onDone(result, { display: 'user' })} />;

    case 'pet':
      if (!companion) {
        onDone('No companion to pet! Use `/buddy hatch` first.', { display: 'system' });
        return null;
      }
      return <PetView onDone={() => onDone('', { display: 'skip' })} />;

    case 'rename':
      if (!companion) {
        onDone('No companion to rename! Use `/buddy hatch` first.', { display: 'system' });
        return null;
      }

      const newName = rest.join(' ').trim();
      if (!newName) {
        onDone('Please provide a new name: `/buddy rename <name>`', { display: 'system' });
        return null;
      }

      saveGlobalConfig(config => ({
        ...config,
        companion: {
          ...config.companion!,
          name: newName,
        },
      }));

      onDone(`Your companion is now called "${newName}"!`, { display: 'user' });
      return null;

    case 'mute':
      saveGlobalConfig(config => ({ ...config, companionMuted: true }));
      onDone('Companion muted. They will hide from view.', { display: 'system' });
      return null;

    case 'unmute':
      saveGlobalConfig(config => ({ ...config, companionMuted: false }));
      onDone('Companion unmuted! Welcome back!', { display: 'system' });
      return null;

    case 'info':
      if (!companion) {
        onDone('No companion yet! Use `/buddy hatch` to get your first buddy.', { display: 'system' });
        return null;
      }
      return <CompanionCard companion={companion} />;

    case 'help':
    default:
      onDone(
        `Buddy Commands:
  /buddy hatch          - Hatch a new companion
  /buddy pet            - Pet your companion
  /buddy rename <name>  - Rename your companion  
  /buddy mute           - Hide your companion
  /buddy unmute         - Show your companion
  /buddy info           - Show companion details
  /buddy help           - Show this help`,
        { display: 'system' },
      );
      return null;
  }
};
