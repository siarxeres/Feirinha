"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { criarFeiraAction } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORIAS = ["Artesanato", "Gastronomia", "Moda", "Decoração", "Orgânicos", "Outros"]

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

export default function NovaFeira() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [dados, setDados] = useState({
    // Passo 1
    nome: "",
    descricao: "",
    categorias: [] as string[],
    // Passo 2
    dataInicio: "",
    dataFim: "",
    horaAbertura: "",
    horaFechamento: "",
    // Passo 3
    endereco: "",
    cidade: "",
    estado: "RO",
    cep: "",
    // Passo 4
    linhas: 5,
    colunas: 5,
    taxaInscricao: 0,
    taxaBarraca: 0,
    prazoPagamento: 24,
  })

  const handleInputChange = (field: string, value: any) => {
    setDados((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCategoria = (cat: string) => {
    setDados((prev) => ({
      ...prev,
      categorias: prev.categorias.includes(cat)
        ? prev.categorias.filter((c) => c !== cat)
        : [...prev.categorias, cat],
    }))
  }

  const handleProximo = () => {
    if (step < 5) {
      setStep(step + 1)
    }
  }

  const handleVoltar = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  async function handleConfirmar() {
    setLoading(true)
    try {
      const result = await criarFeiraAction({
        nome: dados.nome,
        descricao: dados.descricao,
        categorias: dados.categorias,
        dataInicio: dados.dataInicio,
        dataFim: dados.dataFim,
        horaAbertura: dados.horaAbertura,
        horaFechamento: dados.horaFechamento,
        endereco: dados.endereco,
        cidade: dados.cidade,
        estado: dados.estado,
        cep: dados.cep,
        capacidadeBarracas: dados.linhas * dados.colunas,
        taxaInscricao: Number(dados.taxaInscricao),
        taxaBarraca: Number(dados.taxaBarraca),
        prazoPagamento: Number(dados.prazoPagamento),
        linhas: dados.linhas,
        colunas: dados.colunas,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Feira criada com sucesso!")
        router.push(result.feiraId ? `/feiras/${result.feiraId}` : "/dashboard/organizador/feiras")
      }
    } catch (err) {
      console.error(err)
      toast.error("Erro inesperado: " + String(err))
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = (step / 5) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nova Feira</h1>
          <p className="text-gray-600">Passo {step} de 5</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-[#E8560A] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* PASSO 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nome">Nome da Feira *</Label>
                  <Input
                    id="nome"
                    value={dados.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Ex: Feira do Centro"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <textarea
                    id="descricao"
                    value={dados.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva sua feira"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8560A]"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <Label className="block mb-3">Categorias *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIAS.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={dados.categorias.includes(cat)}
                          onChange={() => toggleCategoria(cat)}
                          className="w-4 h-4 accent-[#E8560A]"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={dados.dataInicio}
                      onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataFim">Data de Fim *</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={dados.dataFim}
                      onChange={(e) => handleInputChange("dataFim", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaAbertura">Hora de Abertura *</Label>
                    <Input
                      id="horaAbertura"
                      type="time"
                      value={dados.horaAbertura}
                      onChange={(e) => handleInputChange("horaAbertura", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFechamento">Hora de Fechamento *</Label>
                    <Input
                      id="horaFechamento"
                      type="time"
                      value={dados.horaFechamento}
                      onChange={(e) => handleInputChange("horaFechamento", e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input
                    id="endereco"
                    value={dados.endereco}
                    onChange={(e) => handleInputChange("endereco", e.target.value)}
                    placeholder="Rua, número, complemento"
                    className="mt-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={dados.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      placeholder="São Paulo"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <select
                      id="estado"
                      value={dados.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                      className="mt-1 flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none focus:ring-2 focus:ring-[#E8560A] md:text-sm"
                      required
                    >
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    value={dados.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            )}

            {/* PASSO 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <p className="text-xs text-[#E8560A]">
                  Monte o mapa de barracas da feira. Linhas × Colunas = total de vagas (ex: 5 × 5 = 25 barracas).
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linhas">Número de Linhas (1-20) *</Label>
                    <Input
                      id="linhas"
                      type="number"
                      min={1}
                      max={20}
                      value={dados.linhas}
                      onChange={(e) => handleInputChange("linhas", parseInt(e.target.value))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="colunas">Número de Colunas (1-20) *</Label>
                    <Input
                      id="colunas"
                      type="number"
                      min={1}
                      max={20}
                      value={dados.colunas}
                      onChange={(e) => handleInputChange("colunas", parseInt(e.target.value))}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxaInscricao">Taxa de Inscrição (R$) *</Label>
                    <Input
                      id="taxaInscricao"
                      type="number"
                      step={0.01}
                      min={0}
                      value={dados.taxaInscricao}
                      onChange={(e) => handleInputChange("taxaInscricao", parseFloat(e.target.value))}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxaBarraca">Taxa de Barraca (R$) *</Label>
                    <Input
                      id="taxaBarraca"
                      type="number"
                      step={0.01}
                      min={0}
                      value={dados.taxaBarraca}
                      onChange={(e) => handleInputChange("taxaBarraca", parseFloat(e.target.value))}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="prazoPagamento">Prazo de Pagamento (horas) *</Label>
                  <Input
                    id="prazoPagamento"
                    type="number"
                    min={1}
                    value={dados.prazoPagamento}
                    onChange={(e) => handleInputChange("prazoPagamento", parseInt(e.target.value))}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            )}

            {/* PASSO 5 - REVISÃO */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-semibold text-gray-900">{dados.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Descrição</p>
                    <p className="text-gray-900">{dados.descricao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Categorias</p>
                    <p className="text-gray-900">{dados.categorias.join(", ")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Data Início</p>
                      <p className="font-semibold text-gray-900">{dados.dataInicio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data Fim</p>
                      <p className="font-semibold text-gray-900">{dados.dataFim}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Horário de Abertura</p>
                      <p className="font-semibold text-gray-900">{dados.horaAbertura}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Horário de Fechamento</p>
                      <p className="font-semibold text-gray-900">{dados.horaFechamento}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Local</p>
                      <p className="font-semibold text-gray-900">
                        {dados.endereco}, {dados.cidade} - {dados.estado}, {dados.cep}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grid de Barracas</p>
                      <p className="font-semibold text-gray-900">
                        {dados.linhas} linhas × {dados.colunas} colunas ({dados.linhas * dados.colunas} barracas)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Inscrição</p>
                      <p className="font-semibold text-gray-900">R$ {dados.taxaInscricao.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Barraca</p>
                      <p className="font-semibold text-gray-900">R$ {dados.taxaBarraca.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prazo de Pagamento</p>
                    <p className="font-semibold text-gray-900">{dados.prazoPagamento} horas</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <div className="mt-6 flex justify-between gap-4">
          <Button
            onClick={handleVoltar}
            disabled={step === 1}
            variant="outline"
            className="gap-2"
          >
            <ChevronLeft size={18} />
            Voltar
          </Button>

          {step < 5 ? (
            <Button
              onClick={handleProximo}
              className="bg-[#E8560A] hover:bg-[#C4450A] gap-2"
            >
              Próximo
              <ChevronRight size={18} />
            </Button>
          ) : (
            <Button
              onClick={handleConfirmar}
              disabled={loading}
              className="bg-[#E8560A] hover:bg-[#C4450A] gap-2"
            >
              {loading ? "Criando..." : "Criar Feira"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
