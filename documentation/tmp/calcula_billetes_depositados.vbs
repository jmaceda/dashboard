Option Explicit
Sub CtrlDecode()
    
    Dim gpo As Variant
    Dim gpo2 As Variant
    Dim ary As Variant
    Dim numRows As Long
    Dim wf As WorksheetFunction
    Set wf = Application.WorksheetFunction
    Dim renIni As Long
    Dim posIni As String, posFin As String
    Dim colIni As Long
    Dim colAct As Long
    Dim rowIni As Long
    Dim nomColIni As String
    Dim nomColAct As String
    Dim numColAct As Long
    Dim rowAct As Long
    Dim rangoFormulaBil As String
    Dim rangoFormulaMon As String
    Dim rangoMontoTotal As String
    Dim idxDenom As Long
    Dim rowTotBill As Long
    Dim rowMontos As Long
    
    ' Valores iniciales
    colIni = 3
    rowIni = 2
    nomColIni = "A"
    numRows = Cells(Rows.Count, nomColIni).End(xlUp).Row
    rowTotBill = numRows + 2
    rowMontos = rowTotBill + 2
    rangoFormulaBil = NombreColumna(colIni) & 1 & ":" & NombreColumna(colIni + 6) & rowMontos
    
    ' Limpia el contenido de los datos que extrae
    Range(rangoFormulaBil).ClearContents
    
    ' Encabezados
    Range("A1").Value = "Denominación"
    Range("C1").Value = "$20"
    Range("D1").Value = "$50"
    Range("E1").Value = "$100"
    Range("F1").Value = "$200"
    Range("G1").Value = "$500"
    Range("H1").Value = "$1000"

    ' Extrae el número de billetes y los inserta en la columna correspondiente a la denominación.
    For rowAct = rowIni To numRows
        gpo = Split(wf.Trim(Cells(rowAct, nomColIni).Text), "|")
        colAct = colIni
        
        ' Separa la denominación y el número de billetes y los inserta en la celda correspondiente
        For idxDenom = LBound(gpo) To UBound(gpo)
            gpo2 = Split(gpo(idxDenom), "x")
            Cells(rowAct, colAct).Value = gpo2(0)
            colAct = colAct + 1
        Next idxDenom

    Next rowAct
    

    ' Inserta la formula (SUM) para sumar el número de billetes por denominación.
    For numColAct = colIni To colAct - 1
        rangoFormulaBil = NombreColumna(numColAct) & rowIni & ":" & NombreColumna(numColAct) & numRows
        rangoFormulaMon = NombreColumna(numColAct) & 1 & "*" & NombreColumna(numColAct) & rowTotBill
        
        Cells(rowTotBill, numColAct).Formula = "=SUM(" & rangoFormulaBil & ")"
        Cells(rowMontos, numColAct).NumberFormat = "#,##0"
        Cells(rowMontos, numColAct).Formula = "=" & rangoFormulaMon
    Next numColAct
    
    ' Inserta la formula para sumar los importes.
    rangoMontoTotal = NombreColumna(colIni) & rowMontos & ":" & NombreColumna(numColAct - 1) & rowMontos
    Cells(rowMontos, numColAct).Formula = "=SUM(" & rangoMontoTotal & ")"
    
    ' Ejecuta las formulas (SUM) para calcular el número de billetes por denominación.
    Range(rangoFormulaBil).Activate
    ' Range(rangoFormulaMon).Activate
    Range("C1:I1").EntireColumn.AutoFit
    
End Sub

Sub CtrlDecode()
    
    Dim gpo As Variant
    Dim gpo2 As Variant
    Dim ary As Variant
    Dim numRows As Long
    Dim wf As WorksheetFunction
    Set wf = Application.WorksheetFunction
    Dim renIni As Long
    Dim posIni As String, posFin As String
    Dim colIni As Long
    Dim colAct As Long
    Dim rowIni As Long
    Dim nomColIni As String
    Dim nomColAct As String
    Dim numColAct As Long
    Dim rowAct As Long
    Dim rangoFormulaBil As String
    Dim rangoFormulaMon As String
    Dim rangoMontoTotal As String
    Dim idxDenom As Long
    Dim rowTotBill As Long
    Dim rowMontos As Long
    
    ' Valores iniciales
    colIni = 3
    rowIni = 2
    nomColIni = "A"
    numRows = Cells(Rows.Count, nomColIni).End(xlUp).Row
    rowTotBill = numRows + 2
    rowMontos = rowTotBill + 2
    rangoFormulaBil = NombreColumna(colIni) & 1 & ":" & NombreColumna(colIni + 6) & rowMontos
    
    ' Limpia el contenido de los datos que extrae
    Range(rangoFormulaBil).ClearContents
    
    ' Encabezados
    Range("A1").Value = "Denominación"
    Range("C1").Value = "$20"
    Range("D1").Value = "$50"
    Range("E1").Value = "$100"
    Range("F1").Value = "$200"
    Range("G1").Value = "$500"
    Range("H1").Value = "$1000"

    ' Extrae el número de billetes y los inserta en la columna correspondiente a la denominación.
    For rowAct = rowIni To numRows
        gpo = Split(wf.Trim(Cells(rowAct, nomColIni).Text), ";")
        colAct = colIni
        
        ' Separa la denominación y el número de billetes y los inserta en la celda correspondiente
        For idxDenom = LBound(gpo) To UBound(gpo)
            gpo2 = Split(gpo(idxDenom), "x")
            Cells(rowAct, colAct).Value = gpo2(0)
            colAct = colAct + 1
        Next idxDenom

    Next rowAct
    

    ' Inserta la formula (SUM) para sumar el número de billetes por denominación.
    For numColAct = colIni To colAct - 1
        rangoFormulaBil = NombreColumna(numColAct) & rowIni & ":" & NombreColumna(numColAct) & numRows
        rangoFormulaMon = NombreColumna(numColAct) & 1 & "*" & NombreColumna(numColAct) & rowTotBill
        
        Cells(rowTotBill, numColAct).Formula = "=SUM(" & rangoFormulaBil & ")"
        Cells(rowMontos, numColAct).NumberFormat = "#,##0"
        Cells(rowMontos, numColAct).Formula = "=" & rangoFormulaMon
    Next numColAct
    
    ' Inserta la formula para sumar los importes.
    rangoMontoTotal = NombreColumna(colIni) & rowMontos & ":" & NombreColumna(numColAct - 1) & rowMontos
    Cells(rowMontos, numColAct).Formula = "=SUM(" & rangoMontoTotal & ")"
    
    ' Ejecuta las formulas (SUM) para calcular el número de billetes por denominación.
    Range(rangoFormulaBil).Activate
    ' Range(rangoFormulaMon).Activate
    Range("C1:I1").EntireColumn.AutoFit
    
End Sub

' Determina y devuelve el nombre de la columna en base al número indicado.
Public Function NombreColumna(NumeroColumna As Long) As String
    If NumeroColumna > 26 Then
        NombreColumna = Left(Cells(1, NumeroColumna).Address(False, False), 2)
    Else
        NombreColumna = Left(Cells(1, NumeroColumna).Address(False, False), 1)
    End If
End Function



