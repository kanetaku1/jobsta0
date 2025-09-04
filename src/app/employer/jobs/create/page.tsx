import { CreateJobForm } from '@/components/features/employer';

export default function CreateJobPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">新規求人作成</h1>
            <CreateJobForm />
        </div>
    );
}
