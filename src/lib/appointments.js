export const BUSINESS_ZONE = 'America/Merida';
export const money = value => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(value || 0));
export const duration = value => { const minutes=Number(value || 0); return [minutes>=60?`${Math.floor(minutes/60)} h`:'',minutes%60?`${minutes%60} min`:''].filter(Boolean).join(' ') || '0 min'; };
export function dateKey(value=new Date(), zone=BUSINESS_ZONE) {
  const parts=new Intl.DateTimeFormat('en',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
  const get=type=>parts.find(p=>p.type===type).value;return `${get('year')}-${get('month')}-${get('day')}`;
}
export const timeLabel = (value,zone=BUSINESS_ZONE) => new Intl.DateTimeFormat('es-MX',{timeZone:zone,hour:'2-digit',minute:'2-digit',hour12:true}).format(new Date(value));
export const dateLabel = (value,zone=BUSINESS_ZONE) => new Intl.DateTimeFormat('es-MX',{timeZone:zone,weekday:'short',day:'numeric',month:'long',year:'numeric'}).format(new Date(value));
export function paymentTotals(payments=[]) {
  const validated=payments.filter(p=>p.estado==='VALIDADO');
  const received=validated.filter(p=>p.tipo!=='REEMBOLSO').reduce((n,p)=>n+Number(p.monto),0);
  const refunded=validated.filter(p=>p.tipo==='REEMBOLSO').reduce((n,p)=>n+Number(p.monto),0);
  return {received,refunded,net:Math.round((received-refunded)*100)/100};
}
export const stateLabels = {PENDIENTE:'Pendiente de confirmación',PENDIENTE_VALORACION:'Pendiente de valoración',CONFIRMADA:'Confirmada',EN_PROCESO:'En atención',COMPLETADA:'Completada',CANCELADA:'Cancelada',VALIDADO:'Validado',RECHAZADO:'Rechazado',REPROGRAMADA:'Reprogramada'};
export const editableStates = ['PENDIENTE','PENDIENTE_VALORACION','CONFIRMADA'];
