import PerformanceReport from '../components/PerformanceReport';

export default function ReportPage() {
  return (
    <div className="h-[calc(100vh-0px)] overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <PerformanceReport />
      </div>
    </div>
  );
}
