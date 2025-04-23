document.addEventListener("DOMContentLoaded", function() {
    window.processPDF = async function() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput.files.length === 0) {
            alert('Por favor, selecione um arquivo PDF.');
            return;
        }

        const file = fileInput.files[0];
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = async function() {
            const typedArray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let textContent = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const text = await page.getTextContent();
                text.items.forEach(item => textContent.push(item.str));
            }

            calcularContribuicoes(textContent);
        };
    }

    function calcularContribuicoes(textoExtraido) {
        const inputNomes = document.getElementById('contribuicoes').value;
        if (!inputNomes) {
            alert('Por favor, digite os nomes das contribuições.');
            return;
        }

        const nomesDigitados = inputNomes.split(',').map(nome => nome.trim().toUpperCase());
        let totalContribuicoes = {};

        for (let i = 0; i < textoExtraido.length; i++) {
            nomesDigitados.forEach(nome => {
                if (textoExtraido[i].toUpperCase().includes(nome)) {
                    let valor = encontrarValorNaFrente(textoExtraido, i);
                    if (valor !== null) {
                        totalContribuicoes[nome] = (totalContribuicoes[nome] || 0) + valor;
                    }
                }
            });
        }

        let resultadoSimples = '';
        let resultadoDobro = '';
        if (Object.keys(totalContribuicoes).length > 0) {
            Object.keys(totalContribuicoes).forEach(nome => {
                let valorOriginal = totalContribuicoes[nome];
                let valorDobrado = valorOriginal * 2;

                // Resultados
                resultadoSimples += `${nome}: R$ ${valorOriginal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
                resultadoDobro += `${nome} em dobro: R$ ${valorDobrado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
            });
        } else {
            resultadoSimples = "Nenhuma contribuição encontrada ou valores não identificados corretamente.";
            resultadoDobro = "";
        }

        // Exibindo os resultados no HTML
        document.getElementById('output').innerText = resultadoSimples + '\n' + resultadoDobro;
    }

    function encontrarValorNaFrente(textoArray, index) {
        for (let i = index + 1; i < textoArray.length; i++) {
            let valorTexto = textoArray[i].replace(/[^0-9,\.]/g, '').trim();
            if (/\d/.test(valorTexto)) {
                return parseFloat(valorTexto.replace(/\./g, '').replace(',', '.'));
            }
        }
        return null;
    }
});
