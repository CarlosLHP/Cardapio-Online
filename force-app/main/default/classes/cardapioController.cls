public class cardapioController {

    @AuraEnabled(cacheable=true)
    public static List<Menu__c> getSections(){
        try{
            return [
            SELECT Name, (SELECT Id, Name FROM Sections__r)
            FROM Menu__c
            WHERE isActive__c = true
        ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts(String sectionId){
        List<Id> productsIds = new List<Id>();

        Categoria__c category = [ SELECT Id, Name, (SELECT Id, Name, Price__c, Description FROM Products__r) FROM Categoria__c WHERE Id =: sectionId ];

        for (Product2 product : category.Products__r) {
            productsIds.add(product.Id);
        }

        try {
            return [
                SELECT Id, Name, Price__c, Description FROM Product2 WHERE Id IN :productsIds
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Categoria__c> getSectionsAndProducts(){
        try{
            List<Categoria__c> categorias = [SELECT Id, Name, (SELECT Id, Name, Price__c, Description FROM Products__r), style__c
                FROM Categoria__c
                WHERE Section__r.IsActive__c = true ];
                
            for (Categoria__c categoria : categorias) {
                categoria.style__c = '';
            }

            return categorias;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void createRequest(String mesaId, String productsJson){
        try {
            // Criação do pedido
            Pedido__c request = new Pedido__c(); 
            request.Mesa__c = mesaId;
            insert request;

            //Produtos selecionados
            List<Product2> products = (List<Product2>)JSON.deserialize(productsJson, List<Product2>.class);

            // Vinculação dos produtos ao pedido( pedidos itens )
            List<RequestItem__c> lstRequestItens = new List<RequestItem__c>();

            for (Product2 product : products) {
                RequestItem__c requestItem = new RequestItem__c();
                requestItem.Pedido__c = request.Id;
                requestItem.Product__c = product.Id;
                lstRequestItens.add(requestItem);
            }

            insert lstRequestItens;


        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void callWaiterOrder(String recordId){
        try {
            table__c table = [SELECT Id, Name FROM table__c WHERE Id =: recordId].get(0);
            List<CustomNotificationType > TemplateInfoDetail = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='WaiterOrder'];
            User user = [SELECT Id FROM User WHERE Id = '0058Z000008FCZKQA4'];

            Messaging.CustomNotification currNotification = new Messaging.CustomNotification();
            currNotification.setTitle('Solicitação de Garçom');
            currNotification.setBody('A mesa ' + table.Name + ' solicita garçom');
            currNotification.setNotificationTypeId(TemplateInfoDetail[0].Id);
            currNotification.setTargetId(recordId);

            currNotification.send(new Set<String>{user.Id});
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getImagesProducts(String productsJson){
        Map<String, String> images = new Map<String, String>();
        String url = 'background-image: url(https://unip2-dev-ed.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Png&versionId=';
        String url2 = '&operationContext=CHATTER&contentId=';
        String url3 = ');';
        try {
            List<ProductsVO> products = (List<ProductsVO>)JSON.deserialize(productsJson, List<ProductsVO>.class);
            Set<Id> setProductsIds =  new Set<Id>();
            for (ProductsVO product : products) {
                setProductsIds.add(product.Id);
            }
            List<ContentVersion> listVersion = [SELECT Id, ContentDocument.Id, ContentBodyId, FirstPublishLocationId FROM ContentVersion WHERE FirstPublishLocationId IN :setProductsIds];

            if(!listVersion.isEmpty()){
                for (ContentVersion version : listVersion) {
                images.put(version.FirstPublishLocationId, url + version.Id + url2 + version.ContentBodyId + url3 );
            }
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return images;
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, String> getImagesSections(String categoryJson){
        Map<String, String> images = new Map<String, String>();
        String url = 'background-image: url(https://unip2-dev-ed.file.force.com/sfc/servlet.shepherd/version/renditionDownload?rendition=ORIGINAL_Png&versionId=';
        String url2 = '&operationContext=CHATTER&contentId=';
        String url3 = ');';
        try {
            List<CategoriaVO> categorias = (List<CategoriaVO>)JSON.deserialize(categoryJson, List<CategoriaVO>.class);
            Set<Id> setCategoriasId =  new Set<Id>();
            for (CategoriaVO categoria : categorias) {
                setCategoriasId.add(categoria.Id);
            }
            List<ContentVersion> listVersion = [SELECT Id, ContentDocument.Id, ContentBodyId, FirstPublishLocationId FROM ContentVersion WHERE FirstPublishLocationId IN :setCategoriasId];

            if(!listVersion.isEmpty()){
                for (ContentVersion version : listVersion) {
                images.put(version.FirstPublishLocationId, url + version.Id + url2 + version.ContentBodyId + url3 );
            }
            }

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return images;
    }

    @AuraEnabled
    public static List<Pedido__c> getRequests(String recordId){
        try {
            return [ SELECT Name, Status__c, Value__c FROM Pedido__c WHERE Status__c IN ('Aguardando preparação', 'Em preparo', 'Entregue', 'Solicitado o pagamento') AND Mesa__c =:recordId ORDER BY Value__c DESC];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void closedRequests(String requestsJSON, String recordId){
        List<Pedido__c> requests = (List<Pedido__c>)JSON.deserializeStrict(requestsJSON, List<Pedido__c>.class);
        try {
            for (Pedido__c request : requests) {
                request.Status__c = 'Solicitado o pagamento';
            }

            table__c table = [SELECT Id, Name FROM table__c WHERE Id =: recordId].get(0);
            List<CustomNotificationType > TemplateInfoDetail = [SELECT Id, DeveloperName FROM CustomNotificationType WHERE DeveloperName='WaiterOrder'];
            User user = [SELECT Id FROM User WHERE Id = '0058Z000008FCZKQA4'];

            Messaging.CustomNotification currNotification = new Messaging.CustomNotification();
            currNotification.setTitle('Solicitação de pagamento');
            currNotification.setBody('A mesa ' + table.Name + ' solicita o pagamento da conta');
            currNotification.setNotificationTypeId(TemplateInfoDetail[0].Id);
            currNotification.setTargetId(recordId);
            currNotification.send(new Set<String>{user.Id});

            update requests;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}