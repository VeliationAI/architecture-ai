/** Universal business-core meta-model concepts */
export const UNIVERSAL_ENTITIES = [
  { id: "party", name: "Party", entity_type: "party" as const, description: "Person or organization involved in the business" },
  { id: "account", name: "Account", entity_type: "account" as const, description: "Contractual or financial relationship container" },
  { id: "product", name: "Product/Service", entity_type: "product" as const, description: "Offering sold or consumed" },
  { id: "event", name: "Business Event", entity_type: "event" as const, description: "Transaction or interaction at a point in time" },
  { id: "location", name: "Location", entity_type: "location" as const, description: "Geographic or organizational location" },
  { id: "channel", name: "Channel", entity_type: "other" as const, description: "Touchpoint through which business occurs" },
  { id: "document", name: "Document", entity_type: "document" as const, description: "Supporting artifact or record" },
];

export interface DomainEntityMapping {
  universal_id: string;
  domain_label: string;
  domain_description: string;
}

export interface DomainPack {
  id: string;
  name: string;
  industries: string[];
  entity_mappings: DomainEntityMapping[];
  common_facts: string[];
  common_dimensions: string[];
  kpi_conventions: string[];
}

export const CORE_DOMAIN_PACK: DomainPack = {
  id: "core",
  name: "Universal Business Core",
  industries: ["*"],
  entity_mappings: UNIVERSAL_ENTITIES.map((e) => ({
    universal_id: e.id,
    domain_label: e.name,
    domain_description: e.description,
  })),
  common_facts: ["transaction_fact", "event_fact"],
  common_dimensions: ["date_dim", "party_dim", "product_dim", "location_dim"],
  kpi_conventions: ["volume", "value", "count", "rate"],
};

export const FINANCE_DOMAIN_PACK: DomainPack = {
  id: "finance",
  name: "Financial Services",
  industries: ["finance", "banking", "fintech", "payments"],
  entity_mappings: [
    { universal_id: "party", domain_label: "Customer", domain_description: "Retail or corporate banking customer" },
    { universal_id: "account", domain_label: "Account", domain_description: "Deposit, loan, or investment account" },
    { universal_id: "product", domain_label: "Product", domain_description: "Financial product (card, loan, deposit)" },
    { universal_id: "event", domain_label: "Transaction", domain_description: "Monetary transaction or ledger entry" },
    { universal_id: "location", domain_label: "Branch/Region", domain_description: "Branch, region, or market" },
    { universal_id: "channel", domain_label: "Channel", domain_description: "ATM, mobile, branch, online" },
  ],
  common_facts: ["transaction_fact", "balance_snapshot_fact", "payment_fact"],
  common_dimensions: ["customer_dim", "account_dim", "product_dim", "branch_dim", "date_dim"],
  kpi_conventions: ["AUM", "NPL ratio", "transaction volume", "fee revenue"],
};

export const INSURANCE_DOMAIN_PACK: DomainPack = {
  id: "insurance",
  name: "Insurance",
  industries: ["insurance", "p&c", "life", "health insurance"],
  entity_mappings: [
    { universal_id: "party", domain_label: "Policyholder", domain_description: "Insured party or beneficiary" },
    { universal_id: "account", domain_label: "Policy", domain_description: "Insurance policy contract" },
    { universal_id: "product", domain_label: "Coverage", domain_description: "Coverage type or product line" },
    { universal_id: "event", domain_label: "Claim", domain_description: "Claim event or premium payment" },
    { universal_id: "location", domain_label: "Territory", domain_description: "Underwriting territory or region" },
    { universal_id: "channel", domain_label: "Broker/Agent", domain_description: "Distribution channel" },
  ],
  common_facts: ["premium_fact", "claim_fact", "loss_fact"],
  common_dimensions: ["policyholder_dim", "policy_dim", "coverage_dim", "broker_dim", "date_dim"],
  kpi_conventions: ["loss ratio", "combined ratio", "premium volume", "claim frequency"],
};

export const HEALTHCARE_DOMAIN_PACK: DomainPack = {
  id: "healthcare",
  name: "Healthcare",
  industries: ["healthcare", "hospital", "payer", "provider", "pharma"],
  entity_mappings: [
    { universal_id: "party", domain_label: "Patient", domain_description: "Patient or member" },
    { universal_id: "account", domain_label: "Encounter/Episode", domain_description: "Care episode or encounter" },
    { universal_id: "product", domain_label: "Procedure/Service", domain_description: "Medical procedure or service" },
    { universal_id: "event", domain_label: "Clinical Event", domain_description: "Diagnosis, procedure, or claim event" },
    { universal_id: "location", domain_label: "Facility", domain_description: "Hospital, clinic, or department" },
    { universal_id: "channel", domain_label: "Payer", domain_description: "Insurance payer or plan" },
  ],
  common_facts: ["encounter_fact", "claim_fact", "procedure_fact"],
  common_dimensions: ["patient_dim", "provider_dim", "diagnosis_dim", "payer_dim", "date_dim"],
  kpi_conventions: ["readmission rate", "cost per encounter", "quality measures", "claim denial rate"],
};

export const DOMAIN_PACKS: DomainPack[] = [
  CORE_DOMAIN_PACK,
  FINANCE_DOMAIN_PACK,
  INSURANCE_DOMAIN_PACK,
  HEALTHCARE_DOMAIN_PACK,
];

export function resolveDomainPack(industry?: string, domain?: string): DomainPack {
  const text = `${industry ?? ""} ${domain ?? ""}`.toLowerCase();
  for (const pack of DOMAIN_PACKS) {
    if (pack.id === "core") continue;
    if (pack.industries.some((i) => i !== "*" && text.includes(i))) return pack;
  }
  if (/insurance|policy|claim|premium/.test(text)) return INSURANCE_DOMAIN_PACK;
  if (/finance|bank|payment|loan|card|ledger/.test(text)) return FINANCE_DOMAIN_PACK;
  if (/health|patient|clinical|hospital|payer|provider/.test(text)) return HEALTHCARE_DOMAIN_PACK;
  return CORE_DOMAIN_PACK;
}
