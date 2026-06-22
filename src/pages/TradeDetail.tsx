import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { TradeForm } from '../components/trade/TradeForm'
import { ImageUploader } from '../components/images/ImageUploader'
import { ImageGallery } from '../components/images/ImageGallery'
import { useTrade, useTrades } from '../hooks/useTrades'
import { useTradeImages } from '../hooks/useTradeImages'
import { formatCurrency, formatPips, formatDate, plColor } from '../lib/formatters'

export function TradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { trade, loading, setTrade } = useTrade(id!)
  const { updateTrade, deleteTrade } = useTrades()
  const { images, uploading, uploadImage, deleteImage } = useTradeImages(id!)
  const [showEdit, setShowEdit] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-400 border-t-transparent" />
      </div>
    )
  }

  if (!trade) {
    return <p className="text-dark-300 text-center py-12">Trade not found.</p>
  }

  const isBuy = trade.direction === 'buy'

  const handleUpdate = async (data: Parameters<typeof updateTrade>[1]) => {
    setFormLoading(true)
    const updated = await updateTrade(trade.id, data!)
    if (updated) setTrade(updated)
    setFormLoading(false)
    setShowEdit(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    await deleteTrade(trade.id)
    navigate('/trades')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <button
        onClick={() => navigate('/trades')}
        className="flex items-center gap-2 text-dark-300 hover:text-dark-100 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Trades
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isBuy ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
            {isBuy
              ? <ArrowUpRight size={24} className="text-green-400" />
              : <ArrowDownRight size={24} className="text-red-400" />
            }
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{trade.pair}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isBuy ? 'green' : 'red'}>{trade.direction.toUpperCase()}</Badge>
              <Badge variant={trade.status === 'open' ? 'blue' : 'gray'}>{trade.status}</Badge>
              <span className="text-sm text-dark-300">{formatDate(trade.date)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
            <span className="flex items-center gap-1"><Pencil size={14} /> Edit</span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <span className="flex items-center gap-1"><Trash2 size={14} /> Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs text-dark-300">Entry</p>
          <p className="text-lg font-mono text-white">{trade.entry_price}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">Exit</p>
          <p className="text-lg font-mono text-white">{trade.exit_price ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">Lot Size</p>
          <p className="text-lg font-mono text-white">{trade.lot_size}</p>
        </Card>
        <Card>
          <p className="text-xs text-dark-300">P&L</p>
          <p className={`text-lg font-mono font-semibold ${plColor(trade.profit_loss ?? 0)}`}>
            {trade.profit_loss != null ? formatCurrency(trade.profit_loss) : '—'}
          </p>
        </Card>
      </div>

      {(trade.stop_loss != null || trade.take_profit != null || trade.pips != null) && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <p className="text-xs text-dark-300">Stop Loss</p>
            <p className="font-mono text-white">{trade.stop_loss ?? '—'}</p>
          </Card>
          <Card>
            <p className="text-xs text-dark-300">Take Profit</p>
            <p className="font-mono text-white">{trade.take_profit ?? '—'}</p>
          </Card>
          <Card>
            <p className="text-xs text-dark-300">Pips</p>
            <p className={`font-mono font-semibold ${plColor(trade.pips ?? 0)}`}>
              {trade.pips != null ? formatPips(trade.pips) : '—'}
            </p>
          </Card>
        </div>
      )}

      {trade.notes && (
        <Card>
          <p className="text-xs text-dark-300 mb-2">Notes</p>
          <p className="text-dark-100 whitespace-pre-wrap">{trade.notes}</p>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Screenshots</h2>
        <ImageUploader onUpload={uploadImage} uploading={uploading} />
        <div className="mt-4">
          <ImageGallery images={images} onDelete={deleteImage} />
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Trade">
        <TradeForm
          trade={trade}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}
