import Ability from "./ability";
import Bonus from "./bonus";
import TypeInfo from "./type_info";

const parseAbility = (element: Element): Ability => {
    if (element.getElementsByTagName("strong").length > 0) {
        const dividerIndex = element.textContent?.indexOf(".") ?? 0;
        return {
            name: element.textContent?.substring(0, dividerIndex) ?? null,
            description: element.textContent?.substring(dividerIndex + 1).trim() ?? "",
        }
    } else {
        return {
            name: null,
            description: element.textContent?.trim() ?? "",
        };
    }
}

const isCorrectAbilityContainer = (containerElement: Element, abilityBlockLabel?: string): boolean => {
    const heading = containerElement.getElementsByClassName("mon-stat-block__description-block-heading")[0];
    if (abilityBlockLabel) {
        return heading && heading.textContent?.trim() === abilityBlockLabel;
    }
    return !heading;
}

export const Parser = {
    parseName: (statBlockElement: Element): string | undefined => {
        return statBlockElement.getElementsByClassName("mon-stat-block__name-link")[0]?.textContent?.trim() || undefined;
    },
    
    parseTypeInfo: (statBlockElement: Element): TypeInfo => {
        const typeInfoString = statBlockElement.getElementsByClassName("mon-stat-block__meta")[0]?.textContent?.trim() || undefined;
        if (!typeInfoString) {
            return {
                size: undefined,
                type: undefined,
                subtype: undefined,
                alignment: undefined,
            };
        }
        const match = typeInfoString.match(/(?<size>[a-zA-Z]+)(?: (?<type>[a-zA-Z]+))?(?: \((?<subtype>.+)\))?(?:, (?<alignment>.+))?/);
        if (!match?.groups) {
            return {
                size: undefined,
                type: undefined,
                subtype: undefined,
                alignment: undefined,
            };
        }
        return {
            size: match.groups["size"],
            type: match.groups["type"],
            subtype: match.groups["subtype"],
            alignment: match.groups["alignment"],
        };
    },
    
    parseAttributeValue: (statBlockElement: Element, attributeName: string): string | undefined => {
        const label = [...statBlockElement.getElementsByClassName("mon-stat-block__attribute-label")].filter(x => x.textContent === attributeName)[0];
        return label?.parentElement?.getElementsByClassName("mon-stat-block__attribute-data-value")[0]?.textContent?.trim() || undefined;
    },
    
    parseAttributeExtra: (statBlockElement: Element, attributeName: string): string | undefined => {
        const label = [...statBlockElement.getElementsByClassName("mon-stat-block__attribute-label")].filter(x => x.textContent === attributeName)[0];
        return label?.parentElement?.getElementsByClassName("mon-stat-block__attribute-data-extra")[0]?.textContent?.trim() || undefined;
    },
    
    parseAbilityScore: (statBlockElement: Element, abilityAbbr: string): number | undefined => {
        const label = [...statBlockElement.getElementsByClassName("ability-block__heading")].filter(x => x.textContent === abilityAbbr)[0];
        const scoreString = label?.parentElement?.getElementsByClassName("ability-block__score")[0]?.textContent?.trim()
        return scoreString ? parseInt(scoreString) : undefined;
    },
    
    parseAbilityModifier: (statBlockElement: Element, abilityAbbr: string): string | undefined => {
        const label = [...statBlockElement.getElementsByClassName("ability-block__heading")].filter(x => x.textContent === abilityAbbr)[0];
        return label?.parentElement?.getElementsByClassName("ability-block__modifier")[0]?.textContent?.trim() || undefined;
    },
    
    parseTidbit: (statBlockElement: Element, tidbitName: string): string | undefined => {
        const label = [...statBlockElement.getElementsByClassName("mon-stat-block__tidbit-label")].filter(x => x.textContent === tidbitName)[0];
        return label?.parentElement?.getElementsByClassName("mon-stat-block__tidbit-data")[0]?.textContent?.trim() || undefined;
    },

    parseBonuses: (bonusesString?: string): Bonus[] | undefined => {
        if (!bonusesString) return undefined;
        const bonuses = [];
        for (const bonus of bonusesString.split(", "))
        {
            const parts = bonus.split(" ");
            bonuses.push({ name: parts[0], modifier: parts[1] });
        }
        if (bonuses.length === 0) return undefined;
        return bonuses;
    },

    parseAbilities: (statBlockElement: Element, abilityBlockLabel?: string): Ability[] | undefined => {
        const container = [...statBlockElement.getElementsByClassName("mon-stat-block__description-block")]
            .filter(x => isCorrectAbilityContainer(x, abilityBlockLabel))[0]
            ?.getElementsByClassName("mon-stat-block__description-block-content")[0];
    
        if (!container) return undefined;
    
        let currentAbility: Ability | null = null;
        const abilities: Ability[] = [];
    
        const processAbility = (element: Element) => {
            const newAbility = parseAbility(element);
            if (newAbility.name) {
                if (currentAbility) {
                    abilities.push(currentAbility);
                }
                currentAbility = newAbility;
            } else if (currentAbility != null) {
                currentAbility.description += "\n" + newAbility.description;
            } else {
                currentAbility = newAbility;
            }
        }
    
        for (const traitElement of container.children)
        {
            if (["ol", "ul"].includes(traitElement.tagName.toLowerCase())) {
                for (const listElement of traitElement.children) {
                    processAbility(listElement);
                }
            } else {
                processAbility(traitElement);
            }
        }
    
        if (currentAbility != null) {
            abilities.push(currentAbility);
        }
        return abilities;
    }
};

export default Parser;