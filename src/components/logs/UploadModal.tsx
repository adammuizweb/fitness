'use client'

import { Dialog } from '@/components/ui/dialog'
import { Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react'

type Stage = 'compress' | 'upload' | 'done' | 'error'

interface Props {
  open: boolean
  stage: Stage
  fileName?: string
  fileSize?: string
}

export function UploadModal({ open, stage, fileName, fileSize }: Props) {
  return (
    <Dialog open={open} onClose={() => {}}>
      <div className="text-center py-4 space-y-4">
        {stage === 'compress' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Compressing & optimizing</p>
              <p className="text-sm text-stone-500 mt-1">
                {fileName || 'Photo'} {fileSize ? `(${fileSize})` : ''}
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                <span className="text-sm text-stone-500">Resizing to 1200px max...</span>
              </div>
            </div>
          </>
        )}

        {stage === 'upload' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Uploading</p>
              <p className="text-sm text-stone-500 mt-1">Saving to your workout log...</p>
            </div>
          </>
        )}

        {stage === 'done' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-700">Photo added!</p>
            </div>
          </>
        )}

        {stage === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Upload failed</p>
              <p className="text-sm text-stone-500 mt-1">Check connection and try again</p>
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}
