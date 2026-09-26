'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/app/config';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/**
 * The lines people paste into PowerShell.
 *
 * Built from the configured URLs so the text on screen and the text on the
 * clipboard can never drift apart.
 */
export const installCommand = `irm ${siteConfig.cliInstallUrl} | iex`;
export const directInstallCommand = `irm ${siteConfig.cliDirectUrl} | iex`;

/**
 * Puts text on the clipboard.
 *
 * `navigator.clipboard` only exists in a secure context, which rules out plain
 * http:// previews and some in-app browsers, so there is a `execCommand`
 * fallback behind it. Returns whether anything actually landed.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through - a rejected permission still has the old path left.
    }
  }

  const holder = document.createElement('textarea');
  holder.value = text;
  holder.setAttribute('readonly', '');
  // Off screen, but not display:none - it has to be selectable to be copied.
  holder.style.position = 'fixed';
  holder.style.top = '-1000px';
  holder.style.opacity = '0';
  document.body.appendChild(holder);
  holder.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(holder);
  return copied;
}

type CommandRowProps = {
  command: string;
  label: string;
  /** Shown under the row, small and muted. */
  hint: React.ReactNode;
};

/**
 * One command, one copy button, its own copied state.
 *
 * Each row keeps its own state so copying the fallback does not light up the
 * check on the short one, and the other way round.
 */
function CommandRow({ command, label, hint }: CommandRowProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  const { toast } = useToast();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    const ok = await writeToClipboard(command);

    if (!ok) {
      toast({
        variant: 'destructive',
        title: "Couldn't reach the clipboard",
        description: 'Select the line and copy it by hand.',
      });
      return;
    }

    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);

    toast({
      title: `Copied the ${label.toLowerCase()}`,
      description: 'Paste it into PowerShell and press enter.',
    });
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-start gap-2 rounded-lg border p-1.5 pl-4 text-left backdrop-blur-sm transition-colors',
          'border-primary/40 bg-background/60 hover:border-primary/70',
          copied && 'border-primary'
        )}
      >
        <Terminal className="mt-2.5 hidden h-4 w-4 shrink-0 text-primary/70 sm:block" />

        <code
          onClick={handleCopy}
          title="Click to copy"
          className="flex-1 cursor-pointer whitespace-pre-wrap break-all py-1.5 font-code text-sm leading-relaxed text-foreground/90"
        >
          {command}
        </code>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label={copied ? `${label} copied` : `Copy the ${label.toLowerCase()}`}
          className="shrink-0 text-foreground/70 hover:bg-primary/10 hover:text-primary"
        >
          {copied ? <Check className="text-primary" /> : <Copy />}
        </Button>
      </div>

      <p className="mt-2 px-1 text-xs text-foreground/40">{hint}</p>
    </div>
  );
}

/**
 * The install lines, one click away from the clipboard.
 */
export function InstallCommand({ className }: { className?: string }) {
  return (
    <div className={cn('w-full max-w-2xl', className)}>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-foreground/50">
        Or run it without downloading anything
      </p>

      <div className="space-y-4">
        <CommandRow
          command={installCommand}
          label="Short link"
          hint={
            <>
              Windows PowerShell. Keep the{' '}
              <span className="font-code text-foreground/60">https://</span> -
              without it the command will not resolve.
            </>
          }
        />

        <CommandRow
          command={directInstallCommand}
          label="Direct link"
          hint="Straight from GitHub. Same script - use this one if the short link is blocked or down."
        />
      </div>
    </div>
  );
}
