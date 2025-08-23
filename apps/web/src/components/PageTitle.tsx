export default function PageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {subtitle}
        </p>
      )}
    </div>
  );
}