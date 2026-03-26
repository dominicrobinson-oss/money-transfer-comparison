
import { corridors } from "@/lib/corridors";
import { getProvidersForCorridor } from "@/lib/providers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";

type RouteParams = {
  from: string;
  to: string;
};

export function generateStaticParams() {
  return corridors.map((c) => ({
    from: c.fromCurrency,
    to: c.toCurrency,
  }));
}

export function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Metadata {
  const upperFrom = params.from.toUpperCase();
  const upperTo = params.to.toUpperCase();

  return {
    title: `Best Way to Send Money from ${upperFrom} to ${upperTo} (2026 Comparison)`,
    description: `Compare the best money transfer services to send money from ${upperFrom} to ${upperTo}. Compare fees, exchange rates, and speed.`,
  };
}

export default function CorridorPage({ params }: { params: RouteParams }) {
  const upperFrom = params.from.toUpperCase();
  const upperTo = params.to.toUpperCase();

  // Check if corridor is valid
  const corridor = corridors.find(
    (c) => c.fromCurrency.toLowerCase() === params.from.toLowerCase() &&
           c.toCurrency.toLowerCase() === params.to.toLowerCase()
  );
  if (!corridor) {
    notFound();
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the cheapest way to send money from ${upperFrom} to ${upperTo}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The cheapest provider depends on exchange rate margins and transfer fees.`,
        },
      },
    ],
  };

  const providers = getProvidersForCorridor(params.from, params.to);

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>
        Send Money from {upperFrom} to {upperTo} – Compare Fees & Rates
      </h1>

      <p>
        Compare money transfer providers when sending funds from {upperFrom} to {upperTo}. Review exchange rates, fees, and delivery speed.
      </p>

      <section aria-labelledby="providers-heading" className="mt-8">
        <h2 id="providers-heading" className="text-2xl font-semibold mb-4">Available Providers</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
          {providers.map((provider) => (
            <li key={provider.id} className="flex flex-col items-center bg-white rounded-lg shadow p-4" tabIndex={0} aria-label={provider.name}>
              {provider.logo && (
                <Image
                  src={provider.logo}
                  alt={provider.name + ' logo'}
                  width={64}
                  height={64}
                  className="mb-2 rounded"
                  priority
                />
              )}
              <span className="font-bold text-lg mb-1">{provider.name}</span>
              <span className="text-sm text-gray-600 mb-1">{provider.typicalSpeed}</span>
              <a
                href={provider.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
                aria-label={`Visit ${provider.name} website`}
              >
                Visit Website
              </a>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </main>
  );
}
type RouteParams = {
  from: string;
  to: string;
};

export function generateStaticParams() {
  return corridors.map((c) => ({
    from: c.fromCurrency,
    to: c.toCurrency,
  }));
}

export function generateMetadata(
  { params }: { params: RouteParams }
) {
  const upperFrom = params.from.toUpperCase();
  const upperTo = params.to.toUpperCase();

  return {
    title: `Best Way to Send Money from ${upperFrom} to ${upperTo} (2026 Comparison)`,
    description: `Compare the best money transfer services to send money from ${upperFrom} to ${upperTo}. Compare fees, exchange rates, and speed.`,
  };
}

export default function CorridorPage({
  params,
}: {
  params: RouteParams;
}) {
  const upperFrom = params.from.toUpperCase();
  const upperTo = params.to.toUpperCase();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the cheapest way to send money from ${upperFrom} to ${upperTo}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The cheapest provider depends on exchange rate margins and transfer fees.`,
        },
      },
    ],
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>
        Send Money from {upperFrom} to {upperTo} – Compare Fees & Rates
      </h1>

      <p>
        Compare money transfer providers when sending funds from {upperFrom} to{" "}
        {upperTo}. Review exchange rates, fees, and delivery speed.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </main>
  );
}
import React from "react";
import { corridors } from "@/lib/corridors";
import type { Metadata } from "next";

export function generateStaticParams() {
  return corridors.map((c) => ({
    from: c.fromCurrency,
export function generateMetadata({
  params,
}: {
}): Promise<Metadata> {
  const resolved = await params;

  const from = resolved.from.toUpperCase();
  const to = resolved.to.toUpperCase();

  return {
    title: `Best Way to Send Money from ${from} to ${to} (2026 Comparison)`,
    description: `Compare the best money transfer services to send money from ${from} to ${to}. Compare fees, exchange rates, and speed.`,
  };
import { corridors } from "@/lib/corridors";
import type { Metadata } from "next";

type RouteParams = {
  from: string;
  to: string;
};

export async function generateStaticParams() {
  return corridors.map((c) => ({
    from: c.fromCurrency,
    to: c.toCurrency,
  }));
}

export async function generateMetadata(
  props: { params: Promise<RouteParams> }
): Promise<Metadata> {
  const { from, to } = await props.params;

  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  return {
    title: `Best Way to Send Money from ${upperFrom} to ${upperTo} (2026 Comparison)`,
    description: `Compare the best money transfer services to send money from ${upperFrom} to ${upperTo}. Compare fees, exchange rates, and speed.`,
  };
}

export default async function CorridorPage(
  props: { params: Promise<RouteParams> }
) {
  const { from, to } = await props.params;

  const upperFrom = from.toUpperCase();
  const upperTo = to.toUpperCase();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the cheapest way to send money from ${upperFrom} to ${upperTo}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The cheapest provider depends on exchange rate margins and transfer fees.`,
        },
      },
    ],
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>
        Send Money from {upperFrom} to {upperTo} – Compare Fees & Rates
      </h1>

      <p>
        Compare money transfer providers when sending funds from {upperFrom} to{" "}
        {upperTo}. Review exchange rates, fees, and delivery speed.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </main>
  );
}
  params,
}: {
}) {
  const resolved = await params;

  const from = resolved.from.toUpperCase();
  const to = resolved.to.toUpperCase();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the cheapest way to send money from ${from} to ${to}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The cheapest provider depends on exchange rate margins and transfer fees.`,
        },
      },
    ],
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>
        Send Money from {from} to {to} – Compare Fees & Rates
      </h1>

      <p>
        Compare money transfer providers when sending funds from {from} to{" "}
        {to}. Review exchange rates, fees, and delivery speed.
  </p>

  <script

        import React from "react";
        import { corridors } from "@/lib/corridors";
        import type { Metadata } from "next";

        type RouteParams = {
          from: string;
          to: string;
        };

        export async function generateStaticParams() {
          return corridors.map((c) => ({
            from: c.fromCurrency,
            to: c.toCurrency,
          }));
        }

        export async function generateMetadata(
          props: { params: Promise<RouteParams> }
        ): Promise<Metadata> {
          const { from, to } = await props.params;

          const upperFrom = from.toUpperCase();
          const upperTo = to.toUpperCase();

          return {
            title: `Best Way to Send Money from ${upperFrom} to ${upperTo} (2026 Comparison)`,
            description: `Compare the best money transfer services to send money from ${upperFrom} to ${upperTo}. Compare fees, exchange rates, and speed.`,
          };
        }

        export default async function CorridorPage(
          props: { params: Promise<RouteParams> }
        ) {
          const { from, to } = await props.params;

          const upperFrom = from.toUpperCase();
          const upperTo = to.toUpperCase();

          const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `What is the cheapest way to send money from ${upperFrom} to ${upperTo}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The cheapest provider depends on exchange rate margins and transfer fees.`,
                },
              },
            ],
          };

          return (
            <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
              <h1>
                Send Money from {upperFrom} to {upperTo} – Compare Fees & Rates
              </h1>

              <p>
                Compare money transfer providers when sending funds from {upperFrom} to{" "}
                {upperTo}. Review exchange rates, fees, and delivery speed.
              </p>

              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(faqSchema),
                }}
              />
            </main>
          );
        }
    </main>
  );
}
