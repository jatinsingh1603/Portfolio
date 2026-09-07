import { Chip, Panel, Reveal, Station } from "@/components/primitives";
import type { CapabilityGroup } from "@/content/schema";
import { capabilities } from "@/content/career";
import { projects } from "@/content/projects";
import { cyberLab } from "@/content/labs";

/**
 * Station 07 — the bill of materials. Capability groups from content/career,
 * plus an "Engineering" group derived here from the union of every project's
 * stack (deduplicated, in order of first appearance) so it can never drift from
 * what the projects actually declare. No ratings, no percentages: each group is
 * a panel of hairline chips. A chip whose text names a tool used in the cyber
 * lab carries a cross-reference mark to the stages it appears in.
 */

/** The Engineering group: the deduplicated union of every project's stack. */
const engineeringItems: string[] = [];
for (const project of projects) {
  for (const tech of project.stack) {
    if (!engineeringItems.includes(tech)) engineeringItems.push(tech);
  }
}

const groups: CapabilityGroup[] = [
  ...capabilities,
  { label: "Engineering", items: engineeringItems },
];

/** tool → the cyber-lab stage labels that use it, for the chip cross-reference. */
const toolToStages = new Map<string, string[]>();
for (const stage of cyberLab) {
  for (const tool of stage.tools) {
    const stages = toolToStages.get(tool) ?? [];
    if (!stages.includes(stage.label)) stages.push(stage.label);
    toolToStages.set(tool, stages);
  }
}

/** The two longest groups get a wider column on large screens. */
const wideGroups = new Set(["Security", "Tools"]);

export function Skills() {
  return (
    <Station
      index={7}
      id="skills"
      eyebrow="Bill of materials"
      title="The stack I actually reach for."
      lede="No percentages. No star ratings. Grouped by what it's for."
      zone="teal"
    >
      <ul className="perspective grid list-none gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group, i) => (
          <Reveal
            key={group.label}
            as="li"
            delay={i * 60}
            className={`reveal-rotate ${wideGroups.has(group.label) ? "lg:col-span-2" : ""}`}
          >
            <Panel as="article" className="h-full p-5 md:p-6">
              <h3 className="t-label">
                {group.label.toUpperCase()}
                <span aria-hidden="true"> — </span>
                {group.items.length} items
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const stages = toolToStages.get(item);
                  return (
                    <li key={item}>
                      <Chip
                        xref={
                          stages ? `Used in: ${stages.join(", ")}` : undefined
                        }
                      >
                        {item}
                      </Chip>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </ul>
      <p className="t-caption mt-6 flex items-center gap-2">
        <span
          className="chip chip--xref !min-h-0 !border-0 !p-0"
          aria-hidden="true"
        />
        Marked items also appear in a Cyber Lab stage.
      </p>
    </Station>
  );
}
