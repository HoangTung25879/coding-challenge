type Props = {
  name: string
  imageUrl?: string
}

export function VehicleCell({ name, imageUrl }: Props) {
  return (
    <div className="flex items-center gap-2">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="h-8 w-8 rounded object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-400 text-xs">
          N/A
        </div>
      )}
      <span className="truncate">{name}</span>
    </div>
  )
}
