import { AlertTriangle, Database, TableProperties } from "lucide-react";

const PREFIX_FIELDS = [
  ["allocation", "Registry allocation containing the queried IP."],
  ["as", "Single selected origin ASN for the IP."],
  ["prefix", "Advertised CIDR prefix containing the IP."],
  ["prefix_origins", "All ASNs advertising the prefix."],
  ["prefix_bogon", "True if prefix is unrouted/unallocated (bogon)."],
  ["rpki_status", "Route validation status: unsigned, valid, invalid."],
  ["ix", "Internet exchange context for the IP, when known."],
];

const ASN_FIELDS = [
  ["as", "Autonomous system number."],
  ["entity", "Registry-recorded owning organization."],
  ["in_use", "Whether ASN advertises routes or peers."],
  ["ipv4_prefixes", "Advertised IPv4 prefixes list."],
  ["ipv6_prefixes", "Advertised IPv6 prefixes list."],
  ["peers", "Known peering ASNs."],
  ["ix", "Internet exchange memberships and port speed."] ,
];

function FieldTable({ title, rows }) {
  return (
    <article className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex rounded-lg bg-sky-50 p-2 text-sky-700">
        <TableProperties size={18} />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2 pr-3 font-semibold">Field</th>
              <th className="pb-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([field, description]) => (
              <tr key={field} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-3 font-mono text-xs text-teal-700">{field}</td>
                <td className="py-2 text-slate-700">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function DataReference() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-7xl flex-col gap-5 px-4 py-8 md:px-6 lg:px-8">
      <section className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
          <Database size={18} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">IPNetDB Field Reference</h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600 md:text-base">
          Use this page to understand key fields returned by the prefix and ASN MMDB datasets. IPNetDB data updates daily and is intended for routing context, not geolocation precision.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FieldTable title="Prefix Database (queried by IP)" rows={PREFIX_FIELDS} />
        <FieldTable title="ASN Database (queried by ASN)" rows={ASN_FIELDS} />
      </section>

      <section className="animate-fade-up stagger-2 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <div className="mb-2 inline-flex rounded-lg bg-amber-100 p-2 text-amber-700">
          <AlertTriangle size={17} />
        </div>
        <p className="font-semibold">Operational note</p>
        <p className="mt-2 leading-relaxed">
          Country codes indicate registry allocation country, not physical client location. Combine these fields with network telemetry before making access or trust decisions.
        </p>
      </section>
    </main>
  );
}