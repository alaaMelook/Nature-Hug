export function ConfirmDialog({open, title, description, onCancel, onConfirm}: {
    open: boolean,
    title: string,
    description: string,
    onCancel: () => void,
    onConfirm: () => void
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 flex items-center justify-center align-middle bg-black/50 ">
            <div
                className="bg-white flex flex-col  shadow-lg w-100 h-60 text-center  p-5 rounded-xl border-1 border-gray-200 justify-center gap-2">
                <h2 className="font-semibold text-lg mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{description}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onCancel} className="px-3 py-1 border rounded">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-red-700"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
}
