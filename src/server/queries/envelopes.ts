import { prisma } from "@/lib/prisma";
export async function getAllEnvelopeBalances(){
  const envs=await prisma.envelope.findMany({select:{id:true,name:true,protected:true,active:true}});
  const dist=await prisma.transactionAllocation.groupBy({by:["envelopeId"], _sum:{amount:true}, where:{transaction:{kind:"DIST"}}});
  const outs=await prisma.transactionAllocation.groupBy({by:["envelopeId"], _sum:{amount:true}, where:{transaction:{kind:"OUT"}}});
  const mapD=new Map(dist.map(d=>[d.envelopeId, d._sum.amount??0])); const mapO=new Map(outs.map(o=>[o.envelopeId, o._sum.amount??0]));
  return envs.map(e=>{ const inflow=mapD.get(e.id)??0, outflow=mapO.get(e.id)??0; return { envelopeId:e.id, name:e.name, protected:e.protected, active:e.active, inflow, outflow, balance: inflow - outflow }; });
}
