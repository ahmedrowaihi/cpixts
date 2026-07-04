/**
 * CPIX XSD schemas (from Dash-Industry-Forum/CPIX), embedded so validation
 * works isomorphically. The three imported schemas are shared across CPIX
 * versions; only cpix.xsd differs. Generated from src/schema/.
 */
import type { CpixVersion } from "./version.js";

export const PSKC_XSD: string = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
     xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc"
     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
     xmlns:xenc="http://www.w3.org/2001/04/xmlenc#"
     targetNamespace="urn:ietf:params:xml:ns:keyprov:pskc"
     elementFormDefault="qualified"
     attributeFormDefault="unqualified">
     <xs:import namespace="http://www.w3.org/2000/09/xmldsig#"
          schemaLocation="xmldsig-core-schema.xsd"/>
     <xs:import namespace="http://www.w3.org/2001/04/xmlenc#"
          schemaLocation="xenc-schema.xsd"/>
     <xs:import namespace="http://www.w3.org/XML/1998/namespace"/>
     <xs:complexType name="KeyContainerType">
          <xs:sequence>
               <xs:element name="EncryptionKey"
                    type="ds:KeyInfoType" minOccurs="0"/>
               <xs:element name="MACMethod"
                    type="pskc:MACMethodType" minOccurs="0"/>
               <xs:element name="KeyPackage"
                    type="pskc:KeyPackageType" maxOccurs="unbounded"/>
               <xs:element name="Signature"
                    type="ds:SignatureType" minOccurs="0"/>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType"
                    minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
          <xs:attribute name="Version"
               type="pskc:VersionType" use="required"/>
          <xs:attribute name="Id"
               type="xs:ID" use="optional"/>
     </xs:complexType>
     <xs:simpleType name="VersionType" final="restriction">
          <xs:restriction base="xs:string">
               <xs:pattern value="\\d{1,2}\\.\\d{1,3}"/>
          </xs:restriction>
     </xs:simpleType>
     <xs:complexType name="KeyType">
          <xs:sequence>
               <xs:element name="Issuer"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="AlgorithmParameters"
                    type="pskc:AlgorithmParametersType"
                    minOccurs="0"/>
               <xs:element name="KeyProfileId"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="KeyReference"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="FriendlyName"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="Data"
                    type="pskc:KeyDataType" minOccurs="0"/>
               <xs:element name="UserId"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="Policy"
                    type="pskc:PolicyType" minOccurs="0"/>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType" minOccurs="0"
                    maxOccurs="unbounded"/>
          </xs:sequence>
          <xs:attribute name="Id"
               type="xs:string" use="required"/>
          <xs:attribute name="Algorithm"
               type="pskc:KeyAlgorithmType" use="optional"/>
     </xs:complexType>
     <xs:complexType name="PolicyType">
          <xs:sequence>
               <xs:element name="StartDate"
                    type="xs:dateTime" minOccurs="0"/>
               <xs:element name="ExpiryDate"
                    type="xs:dateTime" minOccurs="0"/>
               <xs:element name="PINPolicy"
                    type="pskc:PINPolicyType" minOccurs="0"/>
               <xs:element name="KeyUsage"
                    type="pskc:KeyUsageType"
                    minOccurs="0" maxOccurs="unbounded"/>
               <xs:element name="NumberOfTransactions"
                    type="xs:nonNegativeInteger" minOccurs="0"/>
               <xs:any namespace="##other"
                    minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="KeyDataType">
          <xs:sequence>
               <xs:element name="Secret"
                    type="pskc:binaryDataType" minOccurs="0"/>
               <xs:element name="Counter"
                    type="pskc:longDataType" minOccurs="0"/>
               <xs:element name="Time"
                    type="pskc:intDataType" minOccurs="0"/>
               <xs:element name="TimeInterval"
                    type="pskc:intDataType" minOccurs="0"/>
               <xs:element name="TimeDrift"
                    type="pskc:intDataType" minOccurs="0"/>
               <xs:any namespace="##other"
                    processContents="lax"
                    minOccurs="0" maxOccurs="unbounded"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="binaryDataType">
          <xs:sequence>
               <xs:choice>
                    <xs:element name="PlainValue"
                         type="xs:base64Binary"/>
                    <xs:element name="EncryptedValue"
                         type="xenc:EncryptedDataType"/>
               </xs:choice>
               <xs:element name="ValueMAC"
                    type="xs:base64Binary" minOccurs="0"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="intDataType">
          <xs:sequence>
               <xs:choice>
                    <xs:element name="PlainValue" type="xs:int"/>
                    <xs:element name="EncryptedValue"
                         type="xenc:EncryptedDataType"/>
               </xs:choice>
               <xs:element name="ValueMAC"
                    type="xs:base64Binary" minOccurs="0"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="stringDataType">
          <xs:sequence>
               <xs:choice>
                    <xs:element name="PlainValue" type="xs:string"/>
                    <xs:element name="EncryptedValue"
                         type="xenc:EncryptedDataType"/>
               </xs:choice>
               <xs:element name="ValueMAC"
                    type="xs:base64Binary" minOccurs="0"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="longDataType">
          <xs:sequence>
               <xs:choice>
                    <xs:element name="PlainValue" type="xs:long"/>
                    <xs:element name="EncryptedValue"
                         type="xenc:EncryptedDataType"/>
               </xs:choice>
               <xs:element name="ValueMAC"
                    type="xs:base64Binary" minOccurs="0"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="PINPolicyType">
          <xs:attribute name="PINKeyId"
               type="xs:string" use="optional"/>
          <xs:attribute name="PINUsageMode"
               type="pskc:PINUsageModeType"/>
          <xs:attribute name="MaxFailedAttempts"
               type="xs:unsignedInt" use="optional"/>
          <xs:attribute name="MinLength"
               type="xs:unsignedInt" use="optional"/>
          <xs:attribute name="MaxLength"
               type="xs:unsignedInt" use="optional"/>
          <xs:attribute name="PINEncoding"
               type="pskc:ValueFormatType" use="optional"/>
          <xs:anyAttribute namespace="##other"/>
     </xs:complexType>
     <xs:simpleType name="PINUsageModeType">
          <xs:restriction base="xs:string">
               <xs:enumeration value="Local"/>
               <xs:enumeration value="Prepend"/>
               <xs:enumeration value="Append"/>
               <xs:enumeration value="Algorithmic"/>
          </xs:restriction>
     </xs:simpleType>
     <xs:simpleType name="KeyUsageType">
          <xs:restriction base="xs:string">
               <xs:enumeration value="OTP"/>
               <xs:enumeration value="CR"/>
               <xs:enumeration value="Encrypt"/>
               <xs:enumeration value="Integrity"/>
               <xs:enumeration value="Verify"/>
               <xs:enumeration value="Unlock"/>
               <xs:enumeration value="Decrypt"/>
               <xs:enumeration value="KeyWrap"/>
               <xs:enumeration value="Unwrap"/>
               <xs:enumeration value="Derive"/>
               <xs:enumeration value="Generate"/>
          </xs:restriction>
     </xs:simpleType>
     <xs:complexType name="DeviceInfoType">
          <xs:sequence>
               <xs:element name="Manufacturer"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="SerialNo"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="Model"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="IssueNo"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="DeviceBinding"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="StartDate"
                    type="xs:dateTime" minOccurs="0"/>
               <xs:element name="ExpiryDate"
                    type="xs:dateTime" minOccurs="0"/>
               <xs:element name="UserId"
                    type="xs:string" minOccurs="0"/>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType" minOccurs="0"
                    maxOccurs="unbounded"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="CryptoModuleInfoType">
          <xs:sequence>
               <xs:element name="Id" type="xs:string"/>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType" minOccurs="0"
                    maxOccurs="unbounded"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="KeyPackageType">
          <xs:sequence>
               <xs:element name="DeviceInfo"
                    type="pskc:DeviceInfoType" minOccurs="0"/>
               <xs:element name="CryptoModuleInfo"
                    type="pskc:CryptoModuleInfoType" minOccurs="0"/>
               <xs:element name="Key"
                    type="pskc:KeyType" minOccurs="0"/>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType" minOccurs="0"
                    maxOccurs="unbounded"/>
          </xs:sequence>
     </xs:complexType>
     <xs:complexType name="AlgorithmParametersType">
          <xs:choice>
               <xs:element name="Suite" type="xs:string" minOccurs="0"/>
               <xs:element name="ChallengeFormat" minOccurs="0">
                    <xs:complexType>
                         <xs:attribute name="Encoding"
                              type="pskc:ValueFormatType"
                                                      use="required"/>
                         <xs:attribute name="Min"
                              type="xs:unsignedInt" use="required"/>
                         <xs:attribute name="Max"
                              type="xs:unsignedInt" use="required"/>
                         <xs:attribute name="CheckDigits"
                              type="xs:boolean" default="false"/>
                    </xs:complexType>
               </xs:element>
               <xs:element name="ResponseFormat" minOccurs="0">
                    <xs:complexType>
                         <xs:attribute name="Encoding"
                              type="pskc:ValueFormatType"
                                                      use="required"/>
                         <xs:attribute name="Length"
                              type="xs:unsignedInt" use="required"/>
                         <xs:attribute name="CheckDigits"
                              type="xs:boolean" default="false"/>
                    </xs:complexType>
               </xs:element>
               <xs:element name="Extensions"
                    type="pskc:ExtensionsType" minOccurs="0"
                    maxOccurs="unbounded"/>
          </xs:choice>
     </xs:complexType>
     <xs:complexType name="ExtensionsType">
          <xs:sequence>
               <xs:any namespace="##other"
                    processContents="lax" maxOccurs="unbounded"/>
          </xs:sequence>
          <xs:attribute name="definition"
               type="xs:anyURI" use="optional"/>
     </xs:complexType>
     <xs:simpleType name="KeyAlgorithmType">
          <xs:restriction base="xs:anyURI"/>
     </xs:simpleType>
     <xs:simpleType name="ValueFormatType">
          <xs:restriction base="xs:string">
               <xs:enumeration value="DECIMAL"/>
               <xs:enumeration value="HEXADECIMAL"/>
               <xs:enumeration value="ALPHANUMERIC"/>
               <xs:enumeration value="BASE64"/>
               <xs:enumeration value="BINARY"/>
          </xs:restriction>
     </xs:simpleType>
     <xs:complexType name="MACMethodType">
           <xs:sequence>
                  <xs:choice>
                        <xs:element name="MACKey"
              type="xenc:EncryptedDataType" minOccurs="0"/>
                        <xs:element name="MACKeyReference"
                                type="xs:string" minOccurs="0"/>
                        </xs:choice>
                        <xs:any namespace="##other"
           processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
       </xs:sequence>
       <xs:attribute name="Algorithm" type="xs:anyURI" use="required"/>
        </xs:complexType>
     <xs:element name="KeyContainer"
          type="pskc:KeyContainerType"/>
</xs:schema>




`;
export const XENC_XSD: string = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE schema  PUBLIC "-//W3C//DTD XMLSchema 200102//EN"
 "http://www.w3.org/2001/XMLSchema.dtd"
 [
   <!ATTLIST schema
     xmlns:xenc CDATA #FIXED 'http://www.w3.org/2001/04/xmlenc#'
     xmlns:ds CDATA #FIXED 'http://www.w3.org/2000/09/xmldsig#'>
   <!ENTITY xenc 'http://www.w3.org/2001/04/xmlenc#'>
   <!ENTITY % p ''>
   <!ENTITY % s ''>
  ]>

<schema xmlns='http://www.w3.org/2001/XMLSchema' version='1.0'
        xmlns:xenc='http://www.w3.org/2001/04/xmlenc#'
        xmlns:ds='http://www.w3.org/2000/09/xmldsig#'
        targetNamespace='http://www.w3.org/2001/04/xmlenc#'
        elementFormDefault='qualified'>

  <import namespace='http://www.w3.org/2000/09/xmldsig#'
          schemaLocation='xmldsig-core-schema.xsd'/>

  <complexType name='EncryptedType' abstract='true'>
    <sequence>
      <element name='EncryptionMethod' type='xenc:EncryptionMethodType'
       minOccurs='0'/>
      <element ref='ds:KeyInfo' minOccurs='0'/>
      <element ref='xenc:CipherData'/>
      <element ref='xenc:EncryptionProperties' minOccurs='0'/>
    </sequence>
    <attribute name='Id' type='ID' use='optional'/>
    <attribute name='Type' type='anyURI' use='optional'/>
    <attribute name='MimeType' type='string' use='optional'/>
    <attribute name='Encoding' type='anyURI' use='optional'/>
  </complexType>
  
  <complexType name='EncryptionMethodType' mixed='true'>
    <sequence>
      <element name='KeySize' minOccurs='0' type='xenc:KeySizeType'/>
      <element name='OAEPparams' minOccurs='0' type='base64Binary'/>
      <any namespace='##other' minOccurs='0' maxOccurs='unbounded'/>
    </sequence>
    <attribute name='Algorithm' type='anyURI' use='required'/>
  </complexType>

    <simpleType name='KeySizeType'>
      <restriction base="integer"/>
    </simpleType>

  <element name='CipherData' type='xenc:CipherDataType'/>
  <complexType name='CipherDataType'>
     <choice>
       <element name='CipherValue' type='base64Binary'/>
       <element ref='xenc:CipherReference'/>
     </choice>
    </complexType>

   <element name='CipherReference' type='xenc:CipherReferenceType'/>
   <complexType name='CipherReferenceType'>
       <choice>
         <element name='Transforms' type='xenc:TransformsType' minOccurs='0'/>
       </choice>
       <attribute name='URI' type='anyURI' use='required'/>
   </complexType>

     <complexType name='TransformsType'>
       <sequence>
         <element ref='ds:Transform' maxOccurs='unbounded'/>
       </sequence>
     </complexType>


  <element name='EncryptedData' type='xenc:EncryptedDataType'/>
  <complexType name='EncryptedDataType'>
    <complexContent>
      <extension base='xenc:EncryptedType'>
       </extension>
    </complexContent>
  </complexType>

  <!-- Children of ds:KeyInfo -->

  <element name='EncryptedKey' type='xenc:EncryptedKeyType'/>
  <complexType name='EncryptedKeyType'>
    <complexContent>
      <extension base='xenc:EncryptedType'>
        <sequence>
          <element ref='xenc:ReferenceList' minOccurs='0'/>
          <element name='CarriedKeyName' type='string' minOccurs='0'/>
        </sequence>
        <attribute name='Recipient' type='string'
         use='optional'/>
      </extension>
    </complexContent>
  </complexType>

    <element name="AgreementMethod" type="xenc:AgreementMethodType"/>
    <complexType name="AgreementMethodType" mixed="true">
      <sequence>
        <element name="KA-Nonce" minOccurs="0" type="base64Binary"/>
        <!-- <element ref="ds:DigestMethod" minOccurs="0"/> -->
        <any namespace="##other" minOccurs="0" maxOccurs="unbounded"/>
        <element name="OriginatorKeyInfo" minOccurs="0" type="ds:KeyInfoType"/>
        <element name="RecipientKeyInfo" minOccurs="0" type="ds:KeyInfoType"/>
      </sequence>
      <attribute name="Algorithm" type="anyURI" use="required"/>
    </complexType>

  <!-- End Children of ds:KeyInfo -->

  <element name='ReferenceList'>
    <complexType>
      <choice minOccurs='1' maxOccurs='unbounded'>
        <element name='DataReference' type='xenc:ReferenceType'/>
        <element name='KeyReference' type='xenc:ReferenceType'/>
      </choice>
    </complexType>
  </element>

  <complexType name='ReferenceType'>
    <sequence>
      <any namespace='##other' minOccurs='0' maxOccurs='unbounded'/>
    </sequence>
    <attribute name='URI' type='anyURI' use='required'/>
  </complexType>


  <element name='EncryptionProperties' type='xenc:EncryptionPropertiesType'/>
  <complexType name='EncryptionPropertiesType'>
    <sequence>
      <element ref='xenc:EncryptionProperty' maxOccurs='unbounded'/>
    </sequence>
    <attribute name='Id' type='ID' use='optional'/>
  </complexType>

    <element name='EncryptionProperty' type='xenc:EncryptionPropertyType'/>
    <complexType name='EncryptionPropertyType' mixed='true'>
      <choice maxOccurs='unbounded'>
        <any namespace='##other' processContents='lax'/>
      </choice>
      <attribute name='Target' type='anyURI' use='optional'/>
      <attribute name='Id' type='ID' use='optional'/>
      <anyAttribute namespace="http://www.w3.org/XML/1998/namespace"/>
    </complexType>

</schema>

`;
export const XMLDSIG_XSD: string = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE schema
  PUBLIC "-//W3C//DTD XMLSchema 200102//EN" "http://www.w3.org/2001/XMLSchema.dtd"
 [
   <!ATTLIST schema 
     xmlns:ds CDATA #FIXED "http://www.w3.org/2000/09/xmldsig#">
   <!ENTITY dsig 'http://www.w3.org/2000/09/xmldsig#'>
   <!ENTITY % p ''>
   <!ENTITY % s ''>
  ]>

<!-- Schema for XML Signatures
    http://www.w3.org/2000/09/xmldsig#
    $Revision: 1.1 $ on $Date: 2002/02/08 20:32:26 $ by $Author: reagle $

    Copyright 2001 The Internet Society and W3C (Massachusetts Institute
    of Technology, Institut National de Recherche en Informatique et en
    Automatique, Keio University). All Rights Reserved.
    http://www.w3.org/Consortium/Legal/

    This document is governed by the W3C Software License [1] as described
    in the FAQ [2].

    [1] http://www.w3.org/Consortium/Legal/copyright-software-19980720
    [2] http://www.w3.org/Consortium/Legal/IPR-FAQ-20000620.html#DTD
-->


<schema xmlns="http://www.w3.org/2001/XMLSchema"
        xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
        targetNamespace="http://www.w3.org/2000/09/xmldsig#"
        version="0.1" elementFormDefault="qualified"> 

<!-- Basic Types Defined for Signatures -->

<simpleType name="CryptoBinary">
  <restriction base="base64Binary">
  </restriction>
</simpleType>

<!-- Start Signature -->

<element name="Signature" type="ds:SignatureType"/>
<complexType name="SignatureType">
  <sequence> 
    <element ref="ds:SignedInfo"/> 
    <element ref="ds:SignatureValue"/> 
    <element ref="ds:KeyInfo" minOccurs="0"/> 
    <element ref="ds:Object" minOccurs="0" maxOccurs="unbounded"/> 
  </sequence>  
  <attribute name="Id" type="ID" use="optional"/>
</complexType>

  <element name="SignatureValue" type="ds:SignatureValueType"/> 
  <complexType name="SignatureValueType">
    <simpleContent>
      <extension base="base64Binary">
        <attribute name="Id" type="ID" use="optional"/>
      </extension>
    </simpleContent>
  </complexType>

<!-- Start SignedInfo -->

<element name="SignedInfo" type="ds:SignedInfoType"/>
<complexType name="SignedInfoType">
  <sequence> 
    <element ref="ds:CanonicalizationMethod"/> 
    <element ref="ds:SignatureMethod"/> 
    <element ref="ds:Reference" maxOccurs="unbounded"/> 
  </sequence>  
  <attribute name="Id" type="ID" use="optional"/> 
</complexType>

  <element name="CanonicalizationMethod" type="ds:CanonicalizationMethodType"/> 
  <complexType name="CanonicalizationMethodType" mixed="true">
    <sequence>
      <any namespace="##any" minOccurs="0" maxOccurs="unbounded"/>
      <!-- (0,unbounded) elements from (1,1) namespace -->
    </sequence>
    <attribute name="Algorithm" type="anyURI" use="required"/> 
  </complexType>

  <element name="SignatureMethod" type="ds:SignatureMethodType"/>
  <complexType name="SignatureMethodType" mixed="true">
    <sequence>
      <element name="HMACOutputLength" minOccurs="0" type="ds:HMACOutputLengthType"/>
      <any namespace="##other" minOccurs="0" maxOccurs="unbounded"/>
      <!-- (0,unbounded) elements from (1,1) external namespace -->
    </sequence>
    <attribute name="Algorithm" type="anyURI" use="required"/> 
  </complexType>

<!-- Start Reference -->

<element name="Reference" type="ds:ReferenceType"/>
<complexType name="ReferenceType">
  <sequence> 
    <element ref="ds:Transforms" minOccurs="0"/> 
    <element ref="ds:DigestMethod"/> 
    <element ref="ds:DigestValue"/> 
  </sequence>
  <attribute name="Id" type="ID" use="optional"/> 
  <attribute name="URI" type="anyURI" use="optional"/> 
  <attribute name="Type" type="anyURI" use="optional"/> 
</complexType>

  <element name="Transforms" type="ds:TransformsType"/>
  <complexType name="TransformsType">
    <sequence>
      <element ref="ds:Transform" maxOccurs="unbounded"/>  
    </sequence>
  </complexType>

  <element name="Transform" type="ds:TransformType"/>
  <complexType name="TransformType" mixed="true">
    <choice minOccurs="0" maxOccurs="unbounded"> 
      <any namespace="##other" processContents="lax"/>
      <!-- (1,1) elements from (0,unbounded) namespaces -->
      <element name="XPath" type="string"/> 
    </choice>
    <attribute name="Algorithm" type="anyURI" use="required"/> 
  </complexType>

<!-- End Reference -->

<element name="DigestMethod" type="ds:DigestMethodType"/>
<complexType name="DigestMethodType" mixed="true"> 
  <sequence>
    <any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
  </sequence>    
  <attribute name="Algorithm" type="anyURI" use="required"/> 
</complexType>

<element name="DigestValue" type="ds:DigestValueType"/>
<simpleType name="DigestValueType">
  <restriction base="base64Binary"/>
</simpleType>

<!-- End SignedInfo -->

<!-- Start KeyInfo -->

<element name="KeyInfo" type="ds:KeyInfoType"/> 
<complexType name="KeyInfoType" mixed="true">
  <choice maxOccurs="unbounded">     
    <element ref="ds:KeyName"/> 
    <element ref="ds:KeyValue"/> 
    <element ref="ds:RetrievalMethod"/> 
    <element ref="ds:X509Data"/> 
    <element ref="ds:PGPData"/> 
    <element ref="ds:SPKIData"/>
    <element ref="ds:MgmtData"/>
    <any processContents="lax" namespace="##other"/>
    <!-- (1,1) elements from (0,unbounded) namespaces -->
  </choice>
  <attribute name="Id" type="ID" use="optional"/> 
</complexType>

  <element name="KeyName" type="string"/>
  <element name="MgmtData" type="string"/>

  <element name="KeyValue" type="ds:KeyValueType"/> 
  <complexType name="KeyValueType" mixed="true">
   <choice>
     <element ref="ds:DSAKeyValue"/>
     <element ref="ds:RSAKeyValue"/>
     <any namespace="##other" processContents="lax"/>
   </choice>
  </complexType>

  <element name="RetrievalMethod" type="ds:RetrievalMethodType"/> 
  <complexType name="RetrievalMethodType">
    <sequence>
      <element ref="ds:Transforms" minOccurs="0"/> 
    </sequence>  
    <attribute name="URI" type="anyURI"/>
    <attribute name="Type" type="anyURI" use="optional"/>
  </complexType>

<!-- Start X509Data -->

<element name="X509Data" type="ds:X509DataType"/> 
<complexType name="X509DataType">
  <sequence maxOccurs="unbounded">
    <choice>
      <element name="X509IssuerSerial" type="ds:X509IssuerSerialType"/>
      <element name="X509SKI" type="base64Binary"/>
      <element name="X509SubjectName" type="string"/>
      <element name="X509Certificate" type="base64Binary"/>
      <element name="X509CRL" type="base64Binary"/>
      <any namespace="##other" processContents="lax"/>
    </choice>
  </sequence>
</complexType>

<complexType name="X509IssuerSerialType"> 
  <sequence> 
    <element name="X509IssuerName" type="string"/> 
    <element name="X509SerialNumber" type="integer"/> 
  </sequence>
</complexType>

<!-- End X509Data -->

<!-- Begin PGPData -->

<element name="PGPData" type="ds:PGPDataType"/> 
<complexType name="PGPDataType"> 
  <choice>
    <sequence>
      <element name="PGPKeyID" type="base64Binary"/> 
      <element name="PGPKeyPacket" type="base64Binary" minOccurs="0"/> 
      <any namespace="##other" processContents="lax" minOccurs="0"
       maxOccurs="unbounded"/>
    </sequence>
    <sequence>
      <element name="PGPKeyPacket" type="base64Binary"/> 
      <any namespace="##other" processContents="lax" minOccurs="0"
       maxOccurs="unbounded"/>
    </sequence>
  </choice>
</complexType>

<!-- End PGPData -->

<!-- Begin SPKIData -->

<element name="SPKIData" type="ds:SPKIDataType"/> 
<complexType name="SPKIDataType">
  <sequence maxOccurs="unbounded">
    <element name="SPKISexp" type="base64Binary"/>
    <any namespace="##other" processContents="lax" minOccurs="0"/>
  </sequence>
</complexType> 

<!-- End SPKIData -->

<!-- End KeyInfo -->

<!-- Start Object (Manifest, SignatureProperty) -->

<element name="Object" type="ds:ObjectType"/> 
<complexType name="ObjectType" mixed="true">
  <sequence minOccurs="0" maxOccurs="unbounded">
    <any namespace="##any" processContents="lax"/>
  </sequence>
  <attribute name="Id" type="ID" use="optional"/> 
  <attribute name="MimeType" type="string" use="optional"/> <!-- add a grep facet -->
  <attribute name="Encoding" type="anyURI" use="optional"/> 
</complexType>

<element name="Manifest" type="ds:ManifestType"/> 
<complexType name="ManifestType">
  <sequence>
    <element ref="ds:Reference" maxOccurs="unbounded"/> 
  </sequence>
  <attribute name="Id" type="ID" use="optional"/> 
</complexType>

<element name="SignatureProperties" type="ds:SignaturePropertiesType"/> 
<complexType name="SignaturePropertiesType">
  <sequence>
    <element ref="ds:SignatureProperty" maxOccurs="unbounded"/> 
  </sequence>
  <attribute name="Id" type="ID" use="optional"/> 
</complexType>

   <element name="SignatureProperty" type="ds:SignaturePropertyType"/> 
   <complexType name="SignaturePropertyType" mixed="true">
     <choice maxOccurs="unbounded">
       <any namespace="##other" processContents="lax"/>
       <!-- (1,1) elements from (1,unbounded) namespaces -->
     </choice>
     <attribute name="Target" type="anyURI" use="required"/> 
     <attribute name="Id" type="ID" use="optional"/> 
   </complexType>

<!-- End Object (Manifest, SignatureProperty) -->

<!-- Start Algorithm Parameters -->

<simpleType name="HMACOutputLengthType">
  <restriction base="integer"/>
</simpleType>

<!-- Start KeyValue Element-types -->

<element name="DSAKeyValue" type="ds:DSAKeyValueType"/>
<complexType name="DSAKeyValueType">
  <sequence>
    <sequence minOccurs="0">
      <element name="P" type="ds:CryptoBinary"/>
      <element name="Q" type="ds:CryptoBinary"/>
    </sequence>
    <element name="G" type="ds:CryptoBinary" minOccurs="0"/>
    <element name="Y" type="ds:CryptoBinary"/>
    <element name="J" type="ds:CryptoBinary" minOccurs="0"/>
    <sequence minOccurs="0">
      <element name="Seed" type="ds:CryptoBinary"/>
      <element name="PgenCounter" type="ds:CryptoBinary"/>
    </sequence>
  </sequence>
</complexType>

<element name="RSAKeyValue" type="ds:RSAKeyValueType"/>
<complexType name="RSAKeyValueType">
  <sequence>
    <element name="Modulus" type="ds:CryptoBinary"/> 
    <element name="Exponent" type="ds:CryptoBinary"/> 
  </sequence>
</complexType> 

<!-- End KeyValue Element-types -->

<!-- End Signature -->

</schema>
`;

export const CPIX_SCHEMAS: Record<CpixVersion, string> = {
  "2.2": `<?xml version="1.0" encoding="UTF-8"?>
<!-- edited with XMLSpy v2008 (http://www.altova.com) by It licence (Nagravision SA) -->
<xs:schema xmlns:cpix="urn:dashif:org:cpix" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" targetNamespace="urn:dashif:org:cpix" elementFormDefault="qualified" attributeFormDefault="unqualified">
	<xs:import namespace="http://www.w3.org/XML/1998/namespace"/>
	<xs:import namespace="http://www.w3.org/2000/09/xmldsig#" schemaLocation="xmldsig-core-schema.xsd"/>
	<xs:import namespace="urn:ietf:params:xml:ns:keyprov:pskc" schemaLocation="pskc.xsd"/>
	<xs:complexType name="UpdateHistoryItemType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="required"/>
		<xs:attribute name="index" type="xs:string" use="required"/>
		<xs:attribute name="source" type="xs:string" use="required"/>
		<xs:attribute name="date" type="xs:dateTime" use="required"/>
	</xs:complexType>
	<xs:complexType name="UpdateHistoryItemListType">
		<xs:sequence>
			<xs:element name="UpdateHistoryItem" type="cpix:UpdateHistoryItemType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyPeriodFilterType">
		<xs:attribute name="periodId" type="xs:ID" use="required"/>
	</xs:complexType>
	<xs:complexType name="LabelFilterType">
		<xs:attribute name="label" type="xs:string" use="required"/>
	</xs:complexType>
	<xs:complexType name="VideoFilterType">
		<xs:attribute name="minPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="hdr" type="xs:boolean" use="optional"/>
		<xs:attribute name="wcg" type="xs:boolean" use="optional"/>
		<xs:attribute name="minFps" type="xs:integer" use="optional"/>
		<xs:attribute name="maxFps" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="AudioFilterType">
		<xs:attribute name="minChannels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxChannels" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="BitrateFilterType">
		<xs:attribute name="minBitrate" type="xs:integer" use="optional"/>
		<xs:attribute name="maxBitrate" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleType">
		<xs:sequence>
			<xs:element name="KeyPeriodFilter" type="cpix:KeyPeriodFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="LabelFilter" type="cpix:LabelFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="VideoFilter" type="cpix:VideoFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="AudioFilter" type="cpix:AudioFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="BitrateFilter" type="cpix:BitrateFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="kid" type="xs:string" use="required"/>
		<xs:attribute name="intendedTrackType" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleListType">
		<xs:sequence>
			<xs:element name="ContentKeyUsageRule" type="cpix:ContentKeyUsageRuleType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="index" type="xs:integer" use="optional"/>
		<xs:attribute name="start" type="xs:dateTime" use="optional"/>
		<xs:attribute name="end" type="xs:dateTime" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodListType">
		<xs:sequence>
			<xs:element name="ContentKeyPeriod" type="cpix:ContentKeyPeriodType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="HLSSignalingDataType">
		<xs:simpleContent>
			<xs:extension base="xs:base64Binary">
				<xs:attribute name="playlist" type="cpix:PlaylistType" use="optional"/>
			</xs:extension>
		</xs:simpleContent>
	</xs:complexType>
	<xs:simpleType name="PlaylistType" final="restriction">
		<xs:restriction base="xs:string">
			<xs:enumeration value="master"/>
			<xs:enumeration value="media"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="DRMSystemType">
		<xs:sequence>
			<xs:element name="PSSH" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="ContentProtectionData" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="URIExtXKey" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="HLSSignalingData" type="cpix:HLSSignalingDataType" minOccurs="0" maxOccurs="2"/>
			<xs:element name="SmoothStreamingProtectionHeaderData" type="xs:string" minOccurs="0"/>
			<xs:element name="HDSSignalingData" type="xs:base64Binary" minOccurs="0"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="systemId" type="xs:string" use="required"/>
		<xs:attribute name="kid" type="xs:string" use="required"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DRMSystemListType">
		<xs:sequence>
			<xs:element name="DRMSystem" type="cpix:DRMSystemType" minOccurs="0" maxOccurs="unbounded">
				<xs:unique name="uniquePlaylistForHLSSignalingData">
					<xs:selector xpath="cpix:HLSSignalingData"/>
					<xs:field xpath="@playlist"/>
				</xs:unique>
			</xs:element>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyType">
		<xs:sequence>
			<xs:element name="Issuer" type="xs:string" minOccurs="0"/>
			<xs:element name="AlgorithmParameters" type="pskc:AlgorithmParametersType" minOccurs="0"/>
			<xs:element name="KeyProfileId" type="xs:string" minOccurs="0"/>
			<xs:element name="KeyReference" type="xs:string" minOccurs="0"/>
			<xs:element name="FriendlyName" type="xs:string" minOccurs="0"/>
			<xs:element name="Data" type="pskc:KeyDataType" minOccurs="0"/>
			<xs:element name="UserId" type="xs:string" minOccurs="0"/>
			<xs:element name="Policy" type="pskc:PolicyType" minOccurs="0"/>
			<xs:element name="Extensions" type="pskc:ExtensionsType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="Algorithm" type="pskc:KeyAlgorithmType" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyType">
		<xs:complexContent>
			<xs:extension base="cpix:KeyType">
				<xs:attribute name="kid" type="xs:string" use="required"/>
				<xs:attribute name="explicitIV" type="xs:base64Binary" use="optional"/>
				<xs:attribute name="dependsOnKey" type="xs:string" use="optional"/>
			</xs:extension>
		</xs:complexContent>
	</xs:complexType>
	<xs:complexType name="ContentKeyListType">
		<xs:sequence>
			<xs:element name="ContentKey" type="cpix:ContentKeyType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataType">
		<xs:sequence>
			<xs:element name="DeliveryKey" type="ds:KeyInfoType"/>
			<xs:element name="DocumentKey" type="cpix:KeyType"/>
			<xs:element name="MACMethod" type="pskc:MACMethodType" minOccurs="0"/>
			<xs:element name="Description" type="xs:string" minOccurs="0"/>
			<xs:element name="SendingEntity" type="xs:string" minOccurs="0"/>
			<xs:element name="SenderPointOfContact" type="xs:string" minOccurs="0"/>
			<xs:element name="ReceivingEntity" type="xs:string" minOccurs="0"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataListType">
		<xs:sequence>
			<xs:element name="DeliveryData" type="cpix:DeliveryDataType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="CpixType">
		<xs:sequence>
			<xs:element name="DeliveryDataList" type="cpix:DeliveryDataListType" minOccurs="0"/>
			<xs:element name="ContentKeyList" type="cpix:ContentKeyListType" minOccurs="0"/>
			<xs:element name="DRMSystemList" type="cpix:DRMSystemListType" minOccurs="0"/>
			<xs:element name="ContentKeyPeriodList" type="cpix:ContentKeyPeriodListType" minOccurs="0"/>
			<xs:element name="ContentKeyUsageRuleList" type="cpix:ContentKeyUsageRuleListType" minOccurs="0"/>
			<xs:element name="UpdateHistoryItemList" type="cpix:UpdateHistoryItemListType" minOccurs="0"/>
			<xs:element ref="ds:Signature" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="contentId" type="xs:string" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:element name="CPIX" type="cpix:CpixType"/>
</xs:schema>`,
  "2.3": `<?xml version="1.0" encoding="UTF-8"?>
<!-- edited with XMLSpy v2008 (http://www.altova.com) by It licence (Nagravision SA) -->
<xs:schema xmlns:cpix="urn:dashif:org:cpix" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" targetNamespace="urn:dashif:org:cpix" elementFormDefault="qualified" attributeFormDefault="unqualified">
	<xs:import namespace="http://www.w3.org/XML/1998/namespace"/>
	<xs:import namespace="http://www.w3.org/2000/09/xmldsig#" schemaLocation="xmldsig-core-schema.xsd"/>
	<xs:import namespace="urn:ietf:params:xml:ns:keyprov:pskc" schemaLocation="pskc.xsd"/>
	<xs:complexType name="UpdateHistoryItemType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="required"/>
		<xs:attribute name="index" type="xs:string" use="required"/>
		<xs:attribute name="source" type="xs:string" use="required"/>
		<xs:attribute name="date" type="xs:dateTime" use="required"/>
	</xs:complexType>
	<xs:complexType name="UpdateHistoryItemListType">
		<xs:sequence>
			<xs:element name="UpdateHistoryItem" type="cpix:UpdateHistoryItemType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyPeriodFilterType">
		<xs:attribute name="periodId" type="xs:IDREF" use="required"/>
	</xs:complexType>
	<xs:complexType name="LabelFilterType">
		<xs:attribute name="label" type="xs:string" use="required"/>
	</xs:complexType>
	<xs:complexType name="VideoFilterType">
		<xs:attribute name="minPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="hdr" type="xs:boolean" use="optional"/>
		<xs:attribute name="wcg" type="xs:boolean" use="optional"/>
		<xs:attribute name="minFps" type="xs:integer" use="optional"/>
		<xs:attribute name="maxFps" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="AudioFilterType">
		<xs:attribute name="minChannels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxChannels" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="BitrateFilterType">
		<xs:attribute name="minBitrate" type="xs:integer" use="optional"/>
		<xs:attribute name="maxBitrate" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleType">
		<xs:sequence>
			<xs:element name="KeyPeriodFilter" type="cpix:KeyPeriodFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="LabelFilter" type="cpix:LabelFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="VideoFilter" type="cpix:VideoFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="AudioFilter" type="cpix:AudioFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="BitrateFilter" type="cpix:BitrateFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="kid" type="xs:string" use="required"/>
		<xs:attribute name="intendedTrackType" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleListType">
		<xs:sequence>
			<xs:element name="ContentKeyUsageRule" type="cpix:ContentKeyUsageRuleType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="index" type="xs:integer" use="optional"/>
		<xs:attribute name="start" type="xs:dateTime" use="optional"/>
		<xs:attribute name="end" type="xs:dateTime" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodListType">
		<xs:sequence>
			<xs:element name="ContentKeyPeriod" type="cpix:ContentKeyPeriodType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="HLSSignalingDataType">
		<xs:simpleContent>
			<xs:extension base="xs:base64Binary">
				<xs:attribute name="playlist" type="cpix:PlaylistType" use="optional"/>
			</xs:extension>
		</xs:simpleContent>
	</xs:complexType>
	<xs:simpleType name="PlaylistType" final="restriction">
		<xs:restriction base="xs:string">
			<xs:enumeration value="master"/>
			<xs:enumeration value="media"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="DRMSystemType">
		<xs:sequence>
			<xs:element name="PSSH" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="ContentProtectionData" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="URIExtXKey" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="HLSSignalingData" type="cpix:HLSSignalingDataType" minOccurs="0" maxOccurs="2"/>
			<xs:element name="SmoothStreamingProtectionHeaderData" type="xs:string" minOccurs="0"/>
			<xs:element name="HDSSignalingData" type="xs:base64Binary" minOccurs="0"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="systemId" type="xs:string" use="required"/>
		<xs:attribute name="kid" type="xs:string" use="required"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DRMSystemListType">
		<xs:sequence>
			<xs:element name="DRMSystem" type="cpix:DRMSystemType" minOccurs="0" maxOccurs="unbounded">
				<xs:unique name="uniquePlaylistForHLSSignalingData">
					<xs:selector xpath="cpix:HLSSignalingData"/>
					<xs:field xpath="@playlist"/>
				</xs:unique>
			</xs:element>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyType">
		<xs:sequence>
			<xs:element name="Issuer" type="xs:string" minOccurs="0"/>
			<xs:element name="AlgorithmParameters" type="pskc:AlgorithmParametersType" minOccurs="0"/>
			<xs:element name="KeyProfileId" type="xs:string" minOccurs="0"/>
			<xs:element name="KeyReference" type="xs:string" minOccurs="0"/>
			<xs:element name="FriendlyName" type="xs:string" minOccurs="0"/>
			<xs:element name="Data" type="pskc:KeyDataType" minOccurs="0"/>
			<xs:element name="UserId" type="xs:string" minOccurs="0"/>
			<xs:element name="Policy" type="pskc:PolicyType" minOccurs="0"/>
			<xs:element name="Extensions" type="pskc:ExtensionsType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="Algorithm" type="pskc:KeyAlgorithmType" use="optional"/>
	</xs:complexType>
	<xs:simpleType name="CencSchemeType" final="restriction">
		<xs:restriction base="xs:string">
			<xs:length value="4"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:simpleType name="KeyIdType">
		<xs:restriction base="xs:string">
			<xs:pattern value="[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="ContentKeyType">
		<xs:complexContent>
			<xs:extension base="cpix:KeyType">
				<xs:attribute name="kid" type="cpix:KeyIdType" use="required"/>
				<xs:attribute name="explicitIV" type="xs:base64Binary" use="optional"/>
				<xs:attribute name="dependsOnKey" type="xs:string" use="optional"/>
				<xs:attribute name="commonEncryptionScheme" type="cpix:CencSchemeType" use="optional"/>
			</xs:extension>
		</xs:complexContent>
	</xs:complexType>
	<xs:complexType name="ContentKeyListType">
		<xs:sequence>
			<xs:element name="ContentKey" type="cpix:ContentKeyType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataType">
		<xs:sequence>
			<xs:element name="DeliveryKey" type="ds:KeyInfoType"/>
			<xs:element name="DocumentKey" type="cpix:KeyType"/>
			<xs:element name="MACMethod" type="pskc:MACMethodType" minOccurs="0"/>
			<xs:element name="Description" type="xs:string" minOccurs="0"/>
			<xs:element name="SendingEntity" type="xs:string" minOccurs="0"/>
			<xs:element name="SenderPointOfContact" type="xs:string" minOccurs="0"/>
			<xs:element name="ReceivingEntity" type="xs:string" minOccurs="0"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataListType">
		<xs:sequence>
			<xs:element name="DeliveryData" type="cpix:DeliveryDataType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="CpixType">
		<xs:sequence>
			<xs:element name="DeliveryDataList" type="cpix:DeliveryDataListType" minOccurs="0"/>
			<xs:element name="ContentKeyList" type="cpix:ContentKeyListType" minOccurs="0"/>
			<xs:element name="DRMSystemList" type="cpix:DRMSystemListType" minOccurs="0"/>
			<xs:element name="ContentKeyPeriodList" type="cpix:ContentKeyPeriodListType" minOccurs="0"/>
			<xs:element name="ContentKeyUsageRuleList" type="cpix:ContentKeyUsageRuleListType" minOccurs="0"/>
			<xs:element name="UpdateHistoryItemList" type="cpix:UpdateHistoryItemListType" minOccurs="0"/>
			<xs:element ref="ds:Signature" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="contentId" type="xs:string" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
		<xs:attribute name="version" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:element name="CPIX" type="cpix:CpixType"/>
</xs:schema>
`,
  "2.3.1": `<?xml version="1.0" encoding="UTF-8"?>
<!-- edited with XMLSpy v2020 rel. 2 (x64) (http://www.altova.com) by licence@nagra.com (Nagravision SA Kudelski Group) -->
<xs:schema xmlns:cpix="urn:dashif:org:cpix" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" targetNamespace="urn:dashif:org:cpix" elementFormDefault="qualified" attributeFormDefault="unqualified">
	<xs:import namespace="http://www.w3.org/XML/1998/namespace"/>
	<xs:import namespace="http://www.w3.org/2000/09/xmldsig#" schemaLocation="xmldsig-core-schema.xsd"/>
	<xs:import namespace="urn:ietf:params:xml:ns:keyprov:pskc" schemaLocation="pskc.xsd"/>
	<xs:simpleType name="UUIDType">
		<xs:restriction base="xs:string">
			<xs:pattern value="[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}"/>
		</xs:restriction>
	</xs:simpleType>
		<xs:simpleType name="PlaylistType" final="restriction">
		<xs:restriction base="xs:string">
			<xs:enumeration value="master"/>
			<xs:enumeration value="media"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="UpdateHistoryItemType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="required"/>
		<xs:attribute name="index" type="xs:string" use="required"/>
		<xs:attribute name="source" type="xs:string" use="required"/>
		<xs:attribute name="date" type="xs:dateTime" use="required"/>
	</xs:complexType>
	<xs:complexType name="UpdateHistoryItemListType">
		<xs:sequence>
			<xs:element name="UpdateHistoryItem" type="cpix:UpdateHistoryItemType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyPeriodFilterType">
		<xs:attribute name="periodId" type="xs:IDREF" use="required"/>
	</xs:complexType>
	<xs:complexType name="LabelFilterType">
		<xs:attribute name="label" type="xs:string" use="required"/>
	</xs:complexType>
	<xs:complexType name="VideoFilterType">
		<xs:attribute name="minPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="hdr" type="xs:boolean" use="optional"/>
		<xs:attribute name="wcg" type="xs:boolean" use="optional"/>
		<xs:attribute name="minFps" type="xs:integer" use="optional"/>
		<xs:attribute name="maxFps" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="AudioFilterType">
		<xs:attribute name="minChannels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxChannels" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="BitrateFilterType">
		<xs:attribute name="minBitrate" type="xs:integer" use="optional"/>
		<xs:attribute name="maxBitrate" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleType">
		<xs:sequence>
			<xs:element name="KeyPeriodFilter" type="cpix:KeyPeriodFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="LabelFilter" type="cpix:LabelFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="VideoFilter" type="cpix:VideoFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="AudioFilter" type="cpix:AudioFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="BitrateFilter" type="cpix:BitrateFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="intendedTrackType" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleListType">
		<xs:sequence>
			<xs:element name="ContentKeyUsageRule" type="cpix:ContentKeyUsageRuleType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="index" type="xs:integer" use="optional"/>
		<xs:attribute name="start" type="xs:dateTime" use="optional"/>
		<xs:attribute name="end" type="xs:dateTime" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodListType">
		<xs:sequence>
			<xs:element name="ContentKeyPeriod" type="cpix:ContentKeyPeriodType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="HLSSignalingDataType">
		<xs:simpleContent>
			<xs:extension base="xs:base64Binary">
				<xs:attribute name="playlist" type="cpix:PlaylistType" use="optional"/>
			</xs:extension>
		</xs:simpleContent>
	</xs:complexType>
	<xs:complexType name="DRMSystemType">
		<xs:sequence>
			<xs:element name="PSSH" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="ContentProtectionData" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="URIExtXKey" type="xs:base64Binary" minOccurs="0"/>
			<xs:element name="HLSSignalingData" type="cpix:HLSSignalingDataType" minOccurs="0" maxOccurs="2"/>
			<xs:element name="SmoothStreamingProtectionHeaderData" type="xs:string" minOccurs="0"/>
			<xs:element name="HDSSignalingData" type="xs:base64Binary" minOccurs="0"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="systemId" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DRMSystemListType">
		<xs:sequence>
			<xs:element name="DRMSystem" type="cpix:DRMSystemType" minOccurs="0" maxOccurs="unbounded">
				<xs:unique name="uniquePlaylistForHLSSignalingData">
					<xs:selector xpath="cpix:HLSSignalingData"/>
					<xs:field xpath="@playlist"/>
				</xs:unique>
			</xs:element>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyType">
		<xs:sequence>
			<xs:element name="Issuer" type="xs:string" minOccurs="0"/>
			<xs:element name="AlgorithmParameters" type="pskc:AlgorithmParametersType" minOccurs="0"/>
			<xs:element name="KeyProfileId" type="xs:string" minOccurs="0"/>
			<xs:element name="KeyReference" type="xs:string" minOccurs="0"/>
			<xs:element name="FriendlyName" type="xs:string" minOccurs="0"/>
			<xs:element name="Data" type="pskc:KeyDataType" minOccurs="0"/>
			<xs:element name="UserId" type="xs:string" minOccurs="0"/>
			<xs:element name="Policy" type="pskc:PolicyType" minOccurs="0"/>
			<xs:element name="Extensions" type="pskc:ExtensionsType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="Algorithm" type="pskc:KeyAlgorithmType" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyType">
		<xs:complexContent>
			<xs:extension base="cpix:KeyType">
				<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
				<xs:attribute name="explicitIV" type="xs:base64Binary" use="optional"/>
				<xs:attribute name="dependsOnKey" type="cpix:UUIDType" use="optional"/>
				<xs:attribute name="commonEncryptionScheme" type="xs:string" use="optional"/>
			</xs:extension>
		</xs:complexContent>
	</xs:complexType>
	<xs:complexType name="ContentKeyListType">
		<xs:sequence>
			<xs:element name="ContentKey" type="cpix:ContentKeyType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataType">
		<xs:sequence>
			<xs:element name="DeliveryKey" type="ds:KeyInfoType"/>
			<xs:element name="DocumentKey" type="cpix:KeyType"/>
			<xs:element name="MACMethod" type="pskc:MACMethodType" minOccurs="0"/>
			<xs:element name="Description" type="xs:string" minOccurs="0"/>
			<xs:element name="SendingEntity" type="xs:string" minOccurs="0"/>
			<xs:element name="SenderPointOfContact" type="xs:string" minOccurs="0"/>
			<xs:element name="ReceivingEntity" type="xs:string" minOccurs="0"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataListType">
		<xs:sequence>
			<xs:element name="DeliveryData" type="cpix:DeliveryDataType" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="CpixType">
		<xs:sequence>
			<xs:element name="DeliveryDataList" type="cpix:DeliveryDataListType" minOccurs="0"/>
			<xs:element name="ContentKeyList" type="cpix:ContentKeyListType" minOccurs="0"/>
			<xs:element name="DRMSystemList" type="cpix:DRMSystemListType" minOccurs="0"/>
			<xs:element name="ContentKeyPeriodList" type="cpix:ContentKeyPeriodListType" minOccurs="0"/>
			<xs:element name="ContentKeyUsageRuleList" type="cpix:ContentKeyUsageRuleListType" minOccurs="0"/>
			<xs:element name="UpdateHistoryItemList" type="cpix:UpdateHistoryItemListType" minOccurs="0"/>
			<xs:element ref="ds:Signature" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="contentId" type="xs:string" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
		<xs:attribute name="version" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:element name="CPIX" type="cpix:CpixType"/>
</xs:schema>
`,
  "2.4": `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:cpix="urn:dashif:org:cpix" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:pskc="urn:ietf:params:xml:ns:keyprov:pskc" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" targetNamespace="urn:dashif:org:cpix" elementFormDefault="qualified" attributeFormDefault="unqualified">
	<xs:import namespace="http://www.w3.org/XML/1998/namespace"/>
	<xs:import namespace="http://www.w3.org/2000/09/xmldsig#" schemaLocation="xmldsig-core-schema.xsd"/>
	<xs:import namespace="urn:ietf:params:xml:ns:keyprov:pskc" schemaLocation="pskc.xsd"/>
	<xs:simpleType name="UUIDType">
		<xs:restriction base="xs:string">
			<xs:pattern value="[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:simpleType name="PlaylistType" final="restriction">
		<xs:restriction base="xs:string">
			<xs:enumeration value="multiVariant"/>
			<xs:enumeration value="media"/>
		</xs:restriction>
	</xs:simpleType>
	<xs:complexType name="UpdateHistoryItemType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="required"/>
		<xs:attribute name="index" type="xs:string" use="required"/>
		<xs:attribute name="source" type="xs:string" use="required"/>
		<xs:attribute name="date" type="xs:dateTime" use="required"/>
	</xs:complexType>
	<xs:complexType name="UpdateHistoryItemListType">
		<xs:sequence>
			<xs:element name="UpdateHistoryItem" type="cpix:UpdateHistoryItemType" minOccurs="1" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
	</xs:complexType>
	<xs:complexType name="KeyPeriodFilterType">
		<xs:attribute name="periodId" type="xs:IDREF" use="required"/>
	</xs:complexType>
	<xs:complexType name="LabelFilterType">
		<xs:attribute name="label" type="xs:string" use="required"/>
	</xs:complexType>
	<xs:complexType name="VideoFilterType">
		<xs:attribute name="minPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxPixels" type="xs:integer" use="optional"/>
		<xs:attribute name="hdr" type="xs:boolean" use="optional"/>
		<xs:attribute name="wcg" type="xs:boolean" use="optional"/>
		<xs:attribute name="minFps" type="xs:integer" use="optional"/>
		<xs:attribute name="maxFps" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="AudioFilterType">
		<xs:attribute name="minChannels" type="xs:integer" use="optional"/>
		<xs:attribute name="maxChannels" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="BitrateFilterType">
		<xs:attribute name="minBitrate" type="xs:integer" use="optional"/>
		<xs:attribute name="maxBitrate" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleType">
		<xs:sequence>
			<xs:element name="KeyPeriodFilter" type="cpix:KeyPeriodFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="LabelFilter" type="cpix:LabelFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="VideoFilter" type="cpix:VideoFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="AudioFilter" type="cpix:AudioFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:element name="BitrateFilter" type="cpix:BitrateFilterType" minOccurs="0" maxOccurs="unbounded"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="intendedTrackType" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyUsageRuleListType">
		<xs:sequence>
			<xs:element name="ContentKeyUsageRule" type="cpix:ContentKeyUsageRuleType" minOccurs="1" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodType">
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="index" type="xs:integer" use="optional"/>
		<xs:attribute name="label" type="xs:string" use="optional"/>		
		<xs:attribute name="start" type="xs:dateTime" use="optional"/>
		<xs:attribute name="end" type="xs:dateTime" use="optional"/>
		<xs:attribute name="startOffset" type="xs:duration" use="optional"/>
		<xs:attribute name="endOffset" type="xs:duration" use="optional"/>
		<xs:attribute name="duration" type="xs:duration" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyPeriodListType">
		<xs:sequence>
			<xs:element name="ContentKeyPeriod" type="cpix:ContentKeyPeriodType" minOccurs="1" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="HLSSignalingDataType">
		<xs:simpleContent>
			<xs:extension base="xs:base64Binary">
				<xs:attribute name="playlist" type="cpix:PlaylistType" use="optional"/>
				<xs:attribute name="allowedCPC" type="xs:string" use="optional"/>
			</xs:extension>
		</xs:simpleContent>
	</xs:complexType>
	<xs:complexType name="ContentProtectionDataType">
		<xs:simpleContent>
			<xs:extension base="xs:base64Binary">
				<xs:attribute name="robustness" type="xs:string" use="optional"/>
			</xs:extension>
		</xs:simpleContent>
	</xs:complexType>
	<xs:complexType name="DRMSystemType">
		<xs:sequence>
			<xs:element name="PSSH" type="xs:base64Binary" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ContentProtectionData" type="cpix:ContentProtectionDataType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="HLSSignalingData" type="cpix:HLSSignalingDataType" minOccurs="0" maxOccurs="2"/>
			<xs:element name="SmoothStreamingProtectionHeaderData" type="xs:string" minOccurs="0"/>
			<xs:any namespace="##other" processContents="lax" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="systemId" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
		<xs:attribute name="HLSAllowedCPC" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DRMSystemListType">
		<xs:sequence>
			<xs:element name="DRMSystem" type="cpix:DRMSystemType" minOccurs="1" maxOccurs="unbounded">
				<xs:unique name="uniquePlaylistForHLSSignalingData">
					<xs:selector xpath="cpix:HLSSignalingData"/>
					<xs:field xpath="@playlist"/>
				</xs:unique>
			</xs:element>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="HDCPData">
		<xs:sequence>
			<xs:element name="HDCPOutputProtectionData" type="xs:base64Binary" minOccurs="0" maxOccurs="1"/>
		</xs:sequence>
		<xs:attribute name="HLSHDCPLevel" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyType">
		<xs:sequence>
			<xs:element name="HDCPData" type="cpix:HDCPData" minOccurs="0" maxOccurs="1"/>
			<xs:element name="Data" type="pskc:KeyDataType" minOccurs="0" maxOccurs="1"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="contentId" type="xs:string" use="optional"/>
		<xs:attribute name="kid" type="cpix:UUIDType" use="required"/>
		<xs:attribute name="explicitIV" type="xs:base64Binary" use="optional"/>
		<xs:attribute name="dependsOnKey" type="cpix:UUIDType" use="optional"/>
		<xs:attribute name="commonEncryptionScheme" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="ContentKeyListType">
		<xs:sequence>
			<xs:element name="ContentKey" type="cpix:ContentKeyType" minOccurs="1" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DocumentKeyType">
		<xs:sequence>
			<xs:element name="Data" type="pskc:KeyDataType" minOccurs="1" maxOccurs="1"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="encryptsKey" type="cpix:UUIDType" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataType">
		<xs:sequence>
			<xs:element name="DeliveryKey" type="ds:KeyInfoType" minOccurs="1" maxOccurs="1"/>
			<xs:element name="DocumentKey" type="cpix:DocumentKeyType" minOccurs="1" maxOccurs="unbounded"/>
			<xs:element name="MACMethod" type="pskc:MACMethodType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="Description" type="xs:string" minOccurs="0" maxOccurs="1"/>
			<xs:element name="SendingEntity" type="xs:string" minOccurs="0" maxOccurs="1"/>
			<xs:element name="SenderPointOfContact" type="xs:string" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ReceivingEntity" type="xs:string" minOccurs="0" maxOccurs="1"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:complexType name="DeliveryDataListType">
		<xs:sequence>
			<xs:element name="DeliveryData" type="cpix:DeliveryDataType" minOccurs="1" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="updateVersion" type="xs:integer" use="optional"/>
	</xs:complexType>
	<xs:complexType name="CpixType">
		<xs:sequence>
			<xs:element name="DeliveryDataList" type="cpix:DeliveryDataListType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ContentKeyList" type="cpix:ContentKeyListType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="DRMSystemList" type="cpix:DRMSystemListType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ContentKeyPeriodList" type="cpix:ContentKeyPeriodListType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="ContentKeyUsageRuleList" type="cpix:ContentKeyUsageRuleListType" minOccurs="0" maxOccurs="1"/>
			<xs:element name="UpdateHistoryItemList" type="cpix:UpdateHistoryItemListType" minOccurs="0" maxOccurs="1"/>
			<xs:element ref="ds:Signature" minOccurs="0" maxOccurs="unbounded"/>
		</xs:sequence>
		<xs:attribute name="id" type="xs:ID" use="optional"/>
		<xs:attribute name="contentId" type="xs:string" use="optional"/>
		<xs:attribute name="name" type="xs:string" use="optional"/>
		<xs:attribute name="version" type="xs:string" use="optional"/>
	</xs:complexType>
	<xs:element name="CPIX" type="cpix:CpixType"/>
</xs:schema>
`,
};
