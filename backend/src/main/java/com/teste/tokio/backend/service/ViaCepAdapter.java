package com.teste.tokio.backend.service;

import com.teste.tokio.backend.dto.cep.CepResponse;
import com.teste.tokio.backend.exception.BusinessException;
import com.teste.tokio.backend.service.interfaces.CepClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class ViaCepAdapter implements CepClient {

    private final RestTemplate rt = new RestTemplate();
    @Value("${via-cep.url}")
    private String url;

    @Override
    public CepResponse fetch(String cep) {
        try {
            String formattedUrl = url.concat(cep);
            CepResponse response = rt.getForObject(formattedUrl + "/json/", CepResponse.class);
            if (response != null && Boolean.TRUE.equals(response.error())) {
                throw new BusinessException("CEP não encontrado");
            }
            return response;
        } catch (Exception e) {
            throw new BusinessException("Erro ao buscar o CEP: " + e.getMessage());
        }
    }
}